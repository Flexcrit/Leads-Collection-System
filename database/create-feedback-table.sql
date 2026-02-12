-- Create lead_feedback table for agent-admin communication
CREATE TABLE IF NOT EXISTS lead_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL CHECK (author_role IN ('admin', 'agent')),
  message TEXT NOT NULL,
  parent_id UUID REFERENCES lead_feedback(id) ON DELETE CASCADE, -- For threaded replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_feedback_lead_id ON lead_feedback(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_feedback_author_id ON lead_feedback(author_id);
CREATE INDEX IF NOT EXISTS idx_lead_feedback_parent_id ON lead_feedback(parent_id);
CREATE INDEX IF NOT EXISTS idx_lead_feedback_created_at ON lead_feedback(created_at);

-- Enable Row Level Security
ALTER TABLE lead_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_feedback

-- Admins can view all feedback for all leads
CREATE POLICY "Admins can view all feedback"
  ON lead_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Agents can view feedback for their own leads
CREATE POLICY "Agents can view feedback for own leads"
  ON lead_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND (
      EXISTS (
        SELECT 1 FROM leads
        WHERE id = lead_feedback.lead_id
        AND (assigned_agent = auth.uid() OR created_by = auth.uid())
      )
    )
  );

-- Admins can insert feedback for any lead
CREATE POLICY "Admins can insert feedback"
  ON lead_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    AND author_id = auth.uid()
    AND author_role = 'admin'
  );

-- Agents can insert feedback for their own leads
CREATE POLICY "Agents can insert feedback for own leads"
  ON lead_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'agent'
    )
    AND author_id = auth.uid()
    AND author_role = 'agent'
    AND (
      EXISTS (
        SELECT 1 FROM leads
        WHERE id = lead_feedback.lead_id
        AND (assigned_agent = auth.uid() OR created_by = auth.uid())
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lead_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_lead_feedback_updated_at
  BEFORE UPDATE ON lead_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_feedback_updated_at();

