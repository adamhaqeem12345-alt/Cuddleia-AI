import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIOrchestrator } from '@/lib/ai-orchestrator'
import { supabase, secureDbOperation } from '@/lib/database'
import { sanitizeInput } from '@/lib/security'

export async function POST(request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { description, projectName, projectType = 'fullstack' } = await request.json()
    
    // Input validation
    if (!description?.trim() || !projectName?.trim()) {
      return NextResponse.json(
        { error: 'Description and project name are required' },
        { status: 400 }
      )
    }

    const sanitizedDescription = sanitizeInput(description)
    const sanitizedProjectName = sanitizeInput(projectName)

    if (sanitizedDescription.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }

    // AI Generation
    const aiOrchestrator = new AIOrchestrator(session.user.id)
    const startTime = Date.now()
    
    const generatedHtml = await aiOrchestrator.generateWebsite(
      sanitizedDescription, 
      projectType
    )
    
    const generationTime = Date.now() - startTime

    // Save to database
    const project = await secureDbOperation(async () => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: session.user.id,
          name: sanitizedProjectName,
          description: sanitizedDescription,
          type: projectType,
          html_content: generatedHtml,
          ai_provider_used: 'multi-provider',
          generation_time_ms: generationTime
        }])
        .select()
        .single()

      if (error) throw error
      return data
    }, session.user.id)

    // Log analytics
    await secureDbOperation(async () => {
      await supabase
        .from('project_analytics')
        .insert([{
          project_id: project.id,
          user_id: session.user.id,
          action: 'generation_success',
          details: {
            description_length: sanitizedDescription.length,
            project_type: projectType,
            generation_time: generationTime
          }
        }])
    }, session.user.id)

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        html: generatedHtml,
        generated_at: project.created_at
      },
      metrics: {
        generation_time: generationTime,
        content_length: generatedHtml.length
      }
    })

  } catch (error) {
    console.error('Generation error:', error)
    
    // Log failure
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      try {
        await supabase
          .from('project_analytics')
          .insert([{
            user_id: session.user.id,
            action: 'generation_failed',
            details: { error: error.message }
          }])
      } catch (logError) {
        console.error('Failed to log error:', logError)
      }
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate website',
        code: error.code || 'GENERATION_FAILED'
      },
      { status: 500 }
    )
  }
}
