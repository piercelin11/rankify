import Description from '@/components/typography/Description'
import React from 'react'
import Link from 'next/link'
import SocialButton from '@/features/auth/components/SocialButton'

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-zinc-700 p-24">
          <div className="space-y-10">
            <div>
              <h2 className="text-center">Welcome back</h2>
              <Description className="text-center">
                Sign in and ranked your favorite artist.
              </Description>
            </div>
    
            <SocialButton />
    
            <p className="text-center text-zinc-400">
              Don't have an account yet?{" "}
              <span className="text-zinc-100 underline">
                <Link href={"/auth/signup"}>Sign up</Link></span>
            </p>
          </div>
        </div>
  )
}
