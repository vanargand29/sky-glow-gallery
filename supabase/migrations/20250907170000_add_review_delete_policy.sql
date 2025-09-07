-- Add DELETE policy for reviews table to allow admin users to delete reviews
CREATE POLICY "Admins can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Also add UPDATE policy for completeness (in case needed later)
CREATE POLICY "Admins can update reviews" 
ON public.reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
