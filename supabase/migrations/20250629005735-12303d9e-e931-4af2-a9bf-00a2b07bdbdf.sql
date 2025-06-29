
-- Delete all data from tables (in order to avoid foreign key constraints)
-- Start with tables that reference other tables first

-- Delete votes first (they reference solutions and challenges)
DELETE FROM public.solution_votes;
DELETE FROM public.challenge_votes;
DELETE FROM public.group_solution_votes;
DELETE FROM public.group_challenge_votes;

-- Delete solutions (they may reference challenges and users)
DELETE FROM public.solutions;
DELETE FROM public.group_solutions;

-- Delete challenge-related data
DELETE FROM public.challenge_tags;
DELETE FROM public.challenges;
DELETE FROM public.group_challenges;

-- Delete group-related data
DELETE FROM public.group_messages;
DELETE FROM public.group_invitations;
DELETE FROM public.group_members;
DELETE FROM public.private_groups;

-- Delete user profiles
DELETE FROM public.profiles;
DELETE FROM public.user_profiles;

-- Delete tags
DELETE FROM public.tags;

-- Reset any sequences if needed (this ensures IDs start from 1 again for any auto-incrementing fields)
-- Note: Since we're using UUIDs, this step is not necessary, but included for completeness
