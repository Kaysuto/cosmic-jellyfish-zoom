ALTER TABLE public.notifications
ADD COLUMN recipient_id UUID REFERENCES public.profiles(id);

COMMENT ON COLUMN public.notifications.recipient_id IS 'Direct recipient of the notification, if applicable.';