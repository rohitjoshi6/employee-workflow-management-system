INSERT INTO roles (id, name, description) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'employee', 'Can submit and track personal internal requests.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'manager', 'Can review requests assigned to their approval queue.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'admin', 'Can view all requests, audit logs, and metrics.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (id, role_id, manager_id, name, email, department) VALUES
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', NULL, 'Elena Garcia', 'elena.garcia@acme.test', 'Operations'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', NULL, 'Priya Shah', 'priya.shah@acme.test', 'People Ops'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '33333333-3333-3333-3333-333333333333', 'Maya Patel', 'maya.patel@acme.test', 'Engineering'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '33333333-3333-3333-3333-333333333333', 'Noah Kim', 'noah.kim@acme.test', 'Finance')
ON CONFLICT (email) DO NOTHING;

INSERT INTO requests (id, requester_id, manager_id, title, description, request_type, priority, status, due_date, completed_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Ergonomic chair request', 'Requesting an ergonomic chair for home office setup.', 'equipment', 'medium', 'pending', '2026-07-01', NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Conference travel approval', 'Approval needed for the annual finance leadership conference.', 'travel', 'high', 'approved', '2026-08-12', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Security training exception', 'Need an extension to complete advanced security training.', 'training', 'low', 'needs_info', '2026-06-30', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO approvals (request_id, approver_id, status, decided_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '33333333-3333-3333-3333-333333333333', 'pending', NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '33333333-3333-3333-3333-333333333333', 'approved', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '33333333-3333-3333-3333-333333333333', 'needs_info', now());

INSERT INTO comments (request_id, author_id, body) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '33333333-3333-3333-3333-333333333333', 'Approved. Please submit receipts after travel.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '33333333-3333-3333-3333-333333333333', 'Please attach the training schedule before final approval.');

INSERT INTO audit_logs (request_id, actor_id, action, previous_status, new_status, metadata) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'request.created', NULL, 'pending', '{"source":"seed"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '33333333-3333-3333-3333-333333333333', 'request.approved', 'pending', 'approved', '{"source":"seed"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '33333333-3333-3333-3333-333333333333', 'request.needs_info', 'pending', 'needs_info', '{"source":"seed"}');

