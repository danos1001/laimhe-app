import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type JobStatus =
  | 'enquiry'
  | 'quoted'
  | 'scheduled'
  | 'in_progress'
  | 'awaiting_invoice'
  | 'paid'

export type JobPriority = 'high' | 'medium' | 'low'

export type Job = {
  id: string
  created_at: string
  user_id: string
  customer_name: string
  job_type: string
  location: string
  description: string
  status: JobStatus
  priority: JobPriority
  visit_count: number
  total_visits: number | null
  amount: number | null
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  enquiry: 'New Enquiry',
  quoted: 'Quoted',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  awaiting_invoice: 'Awaiting Invoice',
  paid: 'Paid',
}

export const STATUS_COLOURS: Record<JobStatus, string> = {
  enquiry: 'bg-gray-100 text-gray-600',
  quoted: 'bg-purple-100 text-purple-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  awaiting_invoice: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
}

export const JOB_TYPES = [
  'Rewire',
  'EV Charger',
  'Solar Install',
  'Fuseboard Upgrade',
  'Fault Finding',
  'Consumer Unit',
  'Lighting',
  'Other',
]
