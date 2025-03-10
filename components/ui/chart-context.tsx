"use client"

import type * as React from "react"

export interface ChartConfig {
  [key: string]: {
    label?: string
    color?: string
  }
}

export interface ChartContextValue {
  config: ChartConfig
  setConfig: React.Dispatch<React.SetStateAction<ChartConfig>>
}