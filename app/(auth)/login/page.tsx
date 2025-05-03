"use client"

import { LoginForm } from "@/components/login-form"
import { Suspense } from "react"


export default function LoginPage() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
                <Suspense fallback={<div>Loading login form...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}