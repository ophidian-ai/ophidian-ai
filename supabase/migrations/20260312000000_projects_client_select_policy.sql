-- Allow clients to SELECT their own projects (previously only admins could access)
CREATE POLICY "projects_select_own"
  ON projects
  FOR SELECT
  USING (client_id IN (SELECT my_client_ids()) OR is_admin());
