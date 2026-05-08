-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- e.g., 'signed', 'created', 'updated'
  entity TEXT NOT NULL, -- e.g., 'contract', 'quote', 'session'
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all logs" 
ON public.audit_logs FOR SELECT 
USING (true); -- Simplified for now, in production restrict to authenticated users

CREATE POLICY "System can insert logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);
