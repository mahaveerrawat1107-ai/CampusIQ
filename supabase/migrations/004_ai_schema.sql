-- ============================================================
-- CampusIQ Stage 6.2 — Migration 004: AI Schema
-- Tables 20-21 (AI conversations and messages)
-- ============================================================

-- ----------------------------------------------------------------
-- TABLE 20: ai_conversations
-- Top-level container for a user's AI chat session
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title      text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_conversations IS
  'A single AI chat session owned by one user. '
  'RLS enforces user_id = auth.uid() on ALL operations. '
  'ai_messages.conversation_id FKs to this table, '
  'and message ownership is verified through the parent conversation.';

CREATE TRIGGER trg_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- TABLE 21: ai_messages
-- Individual messages in an AI conversation
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         text NOT NULL,
    metadata        jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_messages IS
  'Individual messages in an AI conversation. '
  'conversation_id and user_id are immutable after INSERT '
  '(enforced by trg_ai_messages_immutable_keys trigger). '
  'Ownership for all DML is verified via the parent ai_conversations '
  'row (c.user_id = auth.uid()), preventing impersonation attacks.';

-- ----------------------------------------------------------------
-- IMMUTABILITY TRIGGER FUNCTION
-- Prevents conversation_id or user_id from being changed on UPDATE
-- (defined here because it is specific to ai_messages;
--  the SECURITY DEFINER wrapper is in migration 005)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_ai_message_key_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.conversation_id IS DISTINCT FROM OLD.conversation_id THEN
        RAISE EXCEPTION
            'ai_messages.conversation_id is immutable after insert'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION
            'ai_messages.user_id is immutable after insert'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_ai_message_key_mutation() FROM PUBLIC;

COMMENT ON FUNCTION public.prevent_ai_message_key_mutation() IS
  'BEFORE UPDATE trigger on ai_messages. '
  'Raises an exception if conversation_id or user_id is changed, '
  'preventing ownership hijacking or impersonation attacks.';

-- Attach immutability trigger to ai_messages
CREATE TRIGGER trg_ai_messages_immutable_keys
    BEFORE UPDATE ON public.ai_messages
    FOR EACH ROW EXECUTE FUNCTION public.prevent_ai_message_key_mutation();
