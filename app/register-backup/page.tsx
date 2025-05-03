"use client"

import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import Image from "next/image"

export default function RegisterPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left - Register Section */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <img
                            src="/logo.svg"
                            alt="QuantEdge Logo"
                            className="w-8 h-8 filter brightness-200 contrast-150"
                        />
                        QuantEdge Inc.
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <RegisterForm />
                    </div>
                </div>
            </div>

            {/* Right - Background */}
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/login-bg.png"
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}