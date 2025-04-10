"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2, Edit, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface AssetConfigurationProps {
    strategyType: string
}

export default function AssetConfiguration({ strategyType }: AssetConfigurationProps) {
    const [assets, setAssets] = useState([
        {
            id: 1,
            symbol: "BTC/USDT",
            exchange: "binance",
            direction: "both",
            enabled: true,
            customParams: false,
            weight: 30,
        },
        {
            id: 2,
            symbol: "ETH/USDT",
            exchange: "binance",
            direction: "both",
            enabled: true,
            customParams: true,
            weight: 30,
        },
        {
            id: 3,
            symbol: "SOL/USDT",
            exchange: "binance",
            direction: "long",
            enabled: false,
            customParams: false,
            weight: 20,
        },
        {
            id: 4,
            symbol: "XRP/USDT",
            exchange: "binance",
            direction: "both",
            enabled: false,
            customParams: false,
            weight: 20,
        },
    ])

    const [isAddingAsset, setIsAddingAsset] = useState(false)
    const [editingAsset, setEditingAsset] = useState<any>(null)

    const handleAddAsset = () => {
        setAssets([
            ...assets,
            {
                id: assets.length + 1,
                symbol: "BNB/USDT",
                exchange: "binance",
                direction: "both",
                enabled: true,
                customParams: false,
                weight: 20,
            },
        ])
        setIsAddingAsset(false)
    }

    const handleUpdateAsset = () => {
        if (!editingAsset) return

        setAssets(assets.map((asset) => (asset.id === editingAsset.id ? editingAsset : asset)))
        setEditingAsset(null)
    }

    const handleRemoveAsset = (id: number) => {
        setAssets(assets.filter((asset) => asset.id !== id))
    }

    const toggleAssetEnabled = (id: number) => {
        setAssets(assets.map((asset) => (asset.id === id ? { ...asset, enabled: !asset.enabled } : asset)))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Trading Assets</h3>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Asset
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Trading Asset</DialogTitle>
                            <DialogDescription>Configure a new asset for this strategy</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="symbol">Trading Pair</Label>
                                <Select defaultValue="btcusdt">
                                    <SelectTrigger id="symbol">
                                        <SelectValue placeholder="Select trading pair" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="btcusdt">BTC/USDT</SelectItem>
                                        <SelectItem value="ethusdt">ETH/USDT</SelectItem>
                                        <SelectItem value="bnbusdt">BNB/USDT</SelectItem>
                                        <SelectItem value="adausdt">ADA/USDT</SelectItem>
                                        <SelectItem value="dogeusdt">DOGE/USDT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="exchange">Exchange</Label>
                                <Select defaultValue="binance">
                                    <SelectTrigger id="exchange">
                                        <SelectValue placeholder="Select exchange" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="binance">Binance</SelectItem>
                                        <SelectItem value="coinbase">Coinbase</SelectItem>
                                        <SelectItem value="ftx">FTX</SelectItem>
                                        <SelectItem value="kraken">Kraken</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direction">Trading Direction</Label>
                                <Select defaultValue="both">
                                    <SelectTrigger id="direction">
                                        <SelectValue placeholder="Select direction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="long">Long Only</SelectItem>
                                        <SelectItem value="short">Short Only</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight">Portfolio Weight (%)</Label>
                                <Input id="weight" type="number" defaultValue="20" min="1" max="100" />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="custom-params" />
                                <Label htmlFor="custom-params">Use Custom Parameters</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddingAsset(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddAsset}>Add Asset</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Enabled</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Exchange</TableHead>
                            <TableHead>Direction</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Parameters</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow key={asset.id}>
                                <TableCell>
                                    <Switch checked={asset.enabled} onCheckedChange={() => toggleAssetEnabled(asset.id)} />
                                </TableCell>
                                <TableCell className="font-medium">{asset.symbol}</TableCell>
                                <TableCell className="capitalize">{asset.exchange}</TableCell>
                                <TableCell>
                                    {asset.direction === "long" && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                            Long
                                        </Badge>
                                    )}
                                    {asset.direction === "short" && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                                            Short
                                        </Badge>
                                    )}
                                    {asset.direction === "both" && <Badge variant="outline">Both</Badge>}
                                </TableCell>
                                <TableCell>{asset.weight}%</TableCell>
                                <TableCell>
                                    {asset.customParams ? (
                                        <Badge variant="secondary">Custom</Badge>
                                    ) : (
                                        <Badge variant="outline">Default</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setEditingAsset(asset)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Asset Configuration</DialogTitle>
                                                    <DialogDescription>Modify settings for {editingAsset?.symbol}</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-direction">Trading Direction</Label>
                                                        <Select
                                                            defaultValue={editingAsset?.direction}
                                                            onValueChange={(value) => setEditingAsset({ ...editingAsset, direction: value })}
                                                        >
                                                            <SelectTrigger id="edit-direction">
                                                                <SelectValue placeholder="Select direction" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="long">Long Only</SelectItem>
                                                                <SelectItem value="short">Short Only</SelectItem>
                                                                <SelectItem value="both">Both</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-weight">Portfolio Weight (%)</Label>
                                                        <Input
                                                            id="edit-weight"
                                                            type="number"
                                                            value={editingAsset?.weight || ""}
                                                            onChange={(e) =>
                                                                setEditingAsset({ ...editingAsset, weight: Number.parseInt(e.target.value) })
                                                            }
                                                            min="1"
                                                            max="100"
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-2 pt-2">
                                                        <Switch
                                                            id="edit-custom-params"
                                                            checked={editingAsset?.customParams}
                                                            onCheckedChange={(checked) => setEditingAsset({ ...editingAsset, customParams: checked })}
                                                        />
                                                        <Label htmlFor="edit-custom-params">Use Custom Parameters</Label>
                                                    </div>

                                                    {editingAsset?.customParams && (
                                                        <div className="space-y-4 pt-2 border-t mt-4">
                                                            <h4 className="font-medium pt-2">Custom Parameters</h4>

                                                            {strategyType === "mean-reversion" && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-lookback">Lookback Period</Label>
                                                                            <Input id="custom-lookback" type="number" defaultValue="14" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-std-dev">Std Dev Threshold</Label>
                                                                            <Input id="custom-std-dev" type="number" defaultValue="1.5" step="0.1" />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {strategyType === "rsi" && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-rsi-period">RSI Period</Label>
                                                                            <Input id="custom-rsi-period" type="number" defaultValue="10" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-oversold">Oversold Level</Label>
                                                                            <Input id="custom-oversold" type="number" defaultValue="25" />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {strategyType === "macd" && (
                                                                <>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-fast">Fast Period</Label>
                                                                            <Input id="custom-fast" type="number" defaultValue="8" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-slow">Slow Period</Label>
                                                                            <Input id="custom-slow" type="number" defaultValue="21" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-signal">Signal Period</Label>
                                                                            <Input id="custom-signal" type="number" defaultValue="9" />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {strategyType === "breakout" && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-period">Period Length</Label>
                                                                            <Input id="custom-period" type="number" defaultValue="15" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor="custom-threshold">Breakout Threshold</Label>
                                                                            <Input id="custom-threshold" type="number" defaultValue="1.5" step="0.1" />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setEditingAsset(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleUpdateAsset}>Save Changes</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveAsset(asset.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="pt-4">
                <div className="bg-muted/50 p-4 rounded-md flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                        <h4 className="font-medium">Asset Configuration Tips</h4>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                            <li>Use custom parameters to optimize each asset individually</li>
                            <li>Portfolio weights determine position sizing for each asset</li>
                            <li>Consider using different trading directions based on asset characteristics</li>
                            <li>Backtest each asset configuration separately for optimal results</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
