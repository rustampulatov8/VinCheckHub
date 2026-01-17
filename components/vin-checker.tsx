"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  MessageSquareWarning,
  ChevronDown,
  Car,
} from "lucide-react"

interface VehicleData {
  Make: string
  Model: string
  ModelYear: string
  EngineModel: string
  BodyClass: string
  Trim: string
  PlantCountry: string
  PlantState: string
}

interface RecallData {
  Manufacturer: string
  Component: string
  Summary: string
  Consequence: string
  Remedy: string
  NHTSACampaignNumber: string
  ReportReceivedDate: string
}

interface ComplaintData {
  ODINumber: string
  components: string
  summary: string
  dateComplaintFiled: string
}

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/

export function VinChecker() {
  const [vin, setVin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [recalls, setRecalls] = useState<RecallData[]>([])
  const [recallsLoading, setRecallsLoading] = useState(false)
  const [complaints, setComplaints] = useState<ComplaintData[]>([])
  const [complaintsLoading, setComplaintsLoading] = useState(false)
  const [expandedRecalls, setExpandedRecalls] = useState<Record<number, boolean>>({})
  const [expandedComplaints, setExpandedComplaints] = useState<Record<number, boolean>>({})
  const [vehicleInfoExpanded, setVehicleInfoExpanded] = useState(true)
  const [recallsSectionExpanded, setRecallsSectionExpanded] = useState(false)
  const [complaintsSectionExpanded, setComplaintsSectionExpanded] = useState(false)

  const decodeVin = async () => {
    const trimmedVin = vin.trim().toUpperCase()

    if (!trimmedVin) {
      setError("Please enter a VIN")
      return
    }

    if (trimmedVin.length !== 17) {
      setError("VIN must be exactly 17 characters")
      return
    }

    if (!VIN_REGEX.test(trimmedVin)) {
      setError("Invalid VIN format. VINs cannot contain letters I, O, or Q.")
      return
    }

    setLoading(true)
    setRecallsLoading(true)
    setComplaintsLoading(true)
    setError(null)
    setVehicleData(null)
    setRecalls([])
    setComplaints([])
    setExpandedRecalls({})
    setExpandedComplaints({})
    setVehicleInfoExpanded(true)
    setRecallsSectionExpanded(false)
    setComplaintsSectionExpanded(false)

    try {
      const vehicleResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${trimmedVin}?format=json`)
      const data = await vehicleResponse.json()

      let make = ""
      let model = ""
      let year = ""

      if (data.Results) {
        const getValueByName = (variableName: string) => {
          const result = data.Results.find(
            (r: { Variable: string; Value: string | null }) => r.Variable?.toLowerCase() === variableName.toLowerCase(),
          )
          return result?.Value || null
        }

        const getValueById = (variableId: number) => {
          const result = data.Results.find((r: { VariableId: number }) => r.VariableId === variableId)
          return result?.Value || null
        }

        make = getValueById(26) || "N/A"
        model = getValueById(28) || "N/A"
        year = getValueById(29) || "N/A"

        const trimByName = getValueByName("Trim")
        const seriesByName = getValueByName("Series")
        const series2ByName = getValueByName("Series2")
        const trim2ByName = getValueByName("Trim2")
        const trimById = getValueById(110)
        const seriesById = getValueById(34)
        const series2ById = getValueById(109)

        const finalTrim =
          trimByName || seriesByName || series2ByName || trim2ByName || trimById || seriesById || series2ById || "N/A"

        const vehicle: VehicleData = {
          Make: make,
          Model: model,
          ModelYear: year,
          EngineModel: getValueById(18) || "N/A",
          BodyClass: getValueById(5) || "N/A",
          Trim: finalTrim,
          PlantCountry: getValueById(75) || "N/A",
          PlantState: getValueById(76) || "N/A",
        }

        if (vehicle.Make === "N/A" && vehicle.Model === "N/A") {
          setError("Could not decode VIN. Please check if the VIN is valid.")
          setLoading(false)
          setRecallsLoading(false)
          setComplaintsLoading(false)
          return
        }

        setVehicleData(vehicle)
        setLoading(false)
      } else {
        setError("Failed to decode VIN. Please try again.")
        setLoading(false)
        setRecallsLoading(false)
        setComplaintsLoading(false)
        return
      }

      const [recallsResponse, complaintsResponse] = await Promise.all([
        fetch(
          `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
        ),
        fetch(
          `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
        ),
      ])

      const recallsData = await recallsResponse.json()
      if (recallsData.results && Array.isArray(recallsData.results)) {
        setRecalls(recallsData.results)
      }
      setRecallsLoading(false)

      const complaintsData = await complaintsResponse.json()
      if (complaintsData.results && Array.isArray(complaintsData.results)) {
        setComplaints(complaintsData.results.slice(0, 10))
      }
      setComplaintsLoading(false)
    } catch {
      setError("Network error. Please check your connection and try again.")
      setLoading(false)
      setRecallsLoading(false)
      setComplaintsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      decodeVin()
    }
  }

  const dataRows = vehicleData
    ? [
        { label: "Make", value: vehicleData.Make },
        { label: "Model", value: vehicleData.Model },
        { label: "Year", value: vehicleData.ModelYear },
        { label: "Trim", value: vehicleData.Trim },
        { label: "Engine", value: vehicleData.EngineModel },
        { label: "Body Style", value: vehicleData.BodyClass },
        {
          label: "Made In",
          value: [vehicleData.PlantState, vehicleData.PlantCountry].filter((v) => v && v !== "N/A").join(", ") || "N/A",
        },
      ]
    : []

  const ExpandableItem = ({
    index,
    date,
    component,
    description,
    isExpanded,
    onToggle,
    totalItems,
  }: {
    index: number
    date: string
    component: string
    description: string
    isExpanded: boolean
    onToggle: () => void
    totalItems: number
  }) => {
    if (totalItems === 1) {
      return (
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <div className="hidden sm:grid sm:grid-cols-[120px_1fr] gap-x-4 gap-y-2">
            <span className="text-sm font-medium text-muted-foreground">Date</span>
            <span className="text-sm">{date}</span>
            <span className="text-sm font-medium text-muted-foreground">Component</span>
            <span className="text-sm">{component}</span>
            <span className="text-sm font-medium text-muted-foreground">Description</span>
            <span className="text-sm leading-relaxed">{description}</span>
          </div>
          <div className="sm:hidden space-y-3">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</span>
              <span className="text-sm text-right">{date}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Component</span>
              <span className="text-sm text-right flex-1">{component}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                Description
              </span>
              <span className="text-sm leading-relaxed">{description}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="border border-border rounded-lg bg-muted/30 overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4 text-left flex-1 min-w-0">
              <span className="text-xs text-muted-foreground shrink-0">#{index + 1}</span>
              <span className="text-sm font-medium truncate">{component}</span>
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{date}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2 ${isExpanded ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 border-t border-border">
              <div className="hidden sm:grid sm:grid-cols-[120px_1fr] gap-x-4 gap-y-2 pt-4">
                <span className="text-sm font-medium text-muted-foreground">Date</span>
                <span className="text-sm">{date}</span>
                <span className="text-sm font-medium text-muted-foreground">Component</span>
                <span className="text-sm">{component}</span>
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="text-sm leading-relaxed">{description}</span>
              </div>
              <div className="sm:hidden space-y-3 pt-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</span>
                  <span className="text-sm text-right">{date}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Component</span>
                  <span className="text-sm text-right flex-1">{component}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    Description
                  </span>
                  <span className="text-sm leading-relaxed">{description}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter 17-character VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={17}
            className="h-12 text-base pr-12 bg-card font-mono tracking-wider"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {vin.length}/17
          </span>
        </div>
        <Button
          onClick={decodeVin}
          disabled={loading}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Decode VIN
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {vehicleData && (
        <Collapsible open={vehicleInfoExpanded} onOpenChange={setVehicleInfoExpanded}>
          <Card className="bg-card shadow-lg border-accent/20">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-accent" />
                  Vehicle Information
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {vehicleData.ModelYear} {vehicleData.Make} {vehicleData.Model}
                  </span>
                </CardTitle>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${vehicleInfoExpanded ? "rotate-180" : ""}`}
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <div className="hidden sm:block">
                  <table className="w-full">
                    <tbody>
                      {dataRows.map((row, index) => (
                        <tr key={row.label} className={index !== dataRows.length - 1 ? "border-b border-border" : ""}>
                          <td className="px-6 py-4 text-sm font-medium text-muted-foreground w-1/3">{row.label}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sm:hidden divide-y divide-border">
                  {dataRows.map((row) => (
                    <div key={row.label} className="px-4 py-3 flex justify-between items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">{row.label}</span>
                      <span className="text-sm text-foreground text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {vehicleData && !recallsLoading && (
        <Collapsible open={recallsSectionExpanded} onOpenChange={setRecallsSectionExpanded}>
          <Card className="bg-card shadow-lg border-accent/20">
            <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className={`h-5 w-5 ${recalls.length > 0 ? "text-amber-500" : "text-accent"}`} />
                  Safety Recalls
                  {recalls.length > 0 && (
                    <span className="ml-2 text-xs font-normal bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full">
                      {recalls.length} found
                    </span>
                  )}
                  {recalls.length === 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">None found</span>
                  )}
                </CardTitle>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${recallsSectionExpanded ? "rotate-180" : ""}`}
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {recalls.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <p>No open recalls found for this vehicle.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recalls.map((recall, index) => (
                      <ExpandableItem
                        key={index}
                        index={index}
                        date={recall.ReportReceivedDate || "N/A"}
                        component={recall.Component || "N/A"}
                        description={recall.Summary || recall.Consequence || "No description available"}
                        isExpanded={expandedRecalls[index] || false}
                        onToggle={() => setExpandedRecalls((prev) => ({ ...prev, [index]: !prev[index] }))}
                        totalItems={recalls.length}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {recallsLoading && vehicleData && (
        <Card className="bg-card shadow-lg border-accent/20">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking for recalls...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {vehicleData && !complaintsLoading && (
        <Collapsible open={complaintsSectionExpanded} onOpenChange={setComplaintsSectionExpanded}>
          <Card className="bg-card shadow-lg border-accent/20">
            <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquareWarning
                    className={`h-5 w-5 ${complaints.length > 0 ? "text-orange-500" : "text-accent"}`}
                  />
                  Safety Concerns
                  {complaints.length > 0 && (
                    <span className="ml-2 text-xs font-normal bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full">
                      {complaints.length} found
                    </span>
                  )}
                  {complaints.length === 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">None found</span>
                  )}
                </CardTitle>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${complaintsSectionExpanded ? "rotate-180" : ""}`}
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {complaints.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <p>No reported safety concerns found for this vehicle.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.map((complaint, index) => (
                      <ExpandableItem
                        key={index}
                        index={index}
                        date={complaint.dateComplaintFiled || "N/A"}
                        component={complaint.components || "N/A"}
                        description={complaint.summary || "No description available"}
                        isExpanded={expandedComplaints[index] || false}
                        onToggle={() => setExpandedComplaints((prev) => ({ ...prev, [index]: !prev[index] }))}
                        totalItems={complaints.length}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {complaintsLoading && vehicleData && (
        <Card className="bg-card shadow-lg border-accent/20">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking for safety concerns...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
