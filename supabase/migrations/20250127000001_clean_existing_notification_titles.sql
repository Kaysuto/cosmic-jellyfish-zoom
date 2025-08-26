-- Clean existing notification titles that have "Nouvelle demande:" prefix
UPDATE public.notifications 
SET title = REPLACE(title, 'Nouvelle demande: ', '')
WHERE type = 'media_request' 
AND title LIKE 'Nouvelle demande: %';
