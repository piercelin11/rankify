import React from 'react'
import Link from 'next/link'
import SocialButton from '@/features/auth/components/SocialButton'

export default function LoginPage() {
  return (
    <div className="rounded-xl border  p-24">
          <div className="space-y-10">
            <div>
              <h2 className="text-center">Welcome back</h2>
              <p className="text-description text-center">
                Sign in and ranked your favorite artist.
              </p>
            </div>
    
            <SocialButton />
    
            <p className="text-center text-secondary-foreground">
              Don&apos;t have an account yet?{" "}
              <span className="text-foreground underline">
                <Link href={"/auth/signup"}>Sign up</Link></span>
            </p>
          </div>
        </div>
  )
}
