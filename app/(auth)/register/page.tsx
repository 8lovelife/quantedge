"use client"

import { RegisterForm } from "@/components/register-form"


export default function RegisterPage() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
                <RegisterForm />
            </div>
        </div>
    )
}