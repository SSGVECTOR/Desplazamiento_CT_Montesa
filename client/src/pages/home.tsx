import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Calculator, MapPin, ListOrdered, Plus, Trash2, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Line = "ESTE" | "OESTE" | "SUR" | "CENTER";

interface PositionData {
  time: number; // Round trip time
  line: Line;
}

const POSICIONES: Record<string, PositionData> = {
  "CENTRO":  { time: 0,   line: "CENTER" },
  "K48.11":  { time: 60,  line: "ESTE" },
  "K48.12":  { time: 40,  line: "ESTE" },
  "15.20A":  { time: 60,  line: "SUR" },
  "15.20.1": { time: 60,  line: "OESTE" },
  "15.20.2": { time: 80,  line: "OESTE" },
  "15.20.3": { time: 120, line: "OESTE" },
  "15.20.4": { time: 140, line: "OESTE" },
};

// Helper to get one-way time from center
const getOneWay = (key: string) => POSICIONES[key].time / 2;
const getLine = (key: string) => POSICIONES[key].line;

export default function Home() {
  const [route, setRoute] = useState<string[]>([]);
  const [ordersByIndex, setOrdersByIndex] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{
    totalTime: number;
    totalOrders: number;
    average: number;
    path: string;
  } | null>(null);
  
  const { toast } = useToast();

  const addToRoute = (pos: string) => {
    setRoute([...route, pos]);
    setResult(null);
  };

  const removeFromRoute = (indexToRemove: number) => {
    setRoute(route.filter((_, i) => i !== indexToRemove));
    
    // Rebuild orders map to shift indices
    const newOrders: Record<number, number> = {};
    Object.entries(ordersByIndex).forEach(([key, val]) => {
      const idx = parseInt(key);
      if (idx < indexToRemove) {
        newOrders[idx] = val;
      } else if (idx > indexToRemove) {
        newOrders[idx - 1] = val;
      }
    });
    setOrdersByIndex(newOrders);
    setResult(null);
  };

  const updateOrderCount = (index: number, count: string) => {
    const val = parseInt(count) || 0;
    setOrdersByIndex(prev => ({ ...prev, [index]: val }));
    setResult(null);
  };

  const calculate = () => {
    if (route.length === 0) {
      toast({
        title: "Error",
        description: "Añade al menos una posición a la ruta.",
        variant: "destructive"
      });
      return;
    }

    let totalOrders = 0;
    let totalTime = 0;

    let currentLine = "CENTER";
    let currentDist = 0;

    route.forEach((pos, index) => {
      const orders = ordersByIndex[index] || 0;
      if (orders < 0) return; 
      totalOrders += orders;

      const nextLine = getLine(pos);
      const nextDist = getOneWay(pos);

      if (currentLine === "CENTER") {
        // From Center to Anywhere
        totalTime += nextDist;
      } else if (currentLine === nextLine) {
        // Same line movement
        totalTime += Math.abs(currentDist - nextDist) + 10;
      } else {
        // Cross line (back to center then out)
        totalTime += currentDist + nextDist;
      }

      currentLine = nextLine;
      currentDist = nextDist;
    });

    // Return to center
    totalTime += currentDist;

    if (totalOrders === 0) {
      toast({
        title: "Error",
        description: "Introduce al menos una orden.",
        variant: "destructive"
      });
      return;
    }

    const average = Math.round((totalTime / totalOrders) * 100) / 100;

    setResult({
      totalTime,
      totalOrders,
      average,
      path: ["CENTRO", ...route, "CENTRO"].join(" → ")
    });
  };

  const reset = () => {
    setRoute([]);
    setOrdersByIndex({});
    setResult(null);
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#0f1724] text-white font-sans flex items-start md:items-center justify-center p-2 sm:p-6 md:overflow-hidden">
      <Card className="w-full max-w-6xl flex flex-col bg-[#111827] border-[#1f2937] shadow-2xl md:h-full md:max-h-[90vh] md:overflow-hidden my-4 md:my-0">
        <CardHeader className="border-b border-[#1f2937] py-4 shrink-0 bg-[#111827] z-20 sticky top-0">
          <CardTitle className="text-lg md:text-xl font-bold text-white flex items-center justify-center gap-3">
            <div className="p-2 bg-[#38bdf8]/10 rounded-lg">
              <Calculator className="w-5 h-5 text-[#38bdf8]" />
            </div>
            Calculadora de Desplazamiento — CT Montesa
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1f2937] md:overflow-hidden">
          
          {/* Left Column: Available Positions */}
          <div className="flex flex-col md:h-full overflow-hidden bg-[#1a2332]/20 relative">
            <div className="p-3 px-5 border-b border-[#1f2937] bg-[#111827]/80 backdrop-blur z-10 sticky top-0">
              <h3 className="text-[#38bdf8] font-semibold flex items-center gap-2 text-sm uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                1. Destinos Disponibles
              </h3>
              <p className="text-xs text-gray-500 mt-1">Pulsa para añadir a la ruta en orden</p>
            </div>
            
            <ScrollArea className="flex-1" type="always">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {Object.entries(POSICIONES).map(([pos, data]) => {
                   return (
                    <div 
                      key={pos}
                      onClick={() => addToRoute(pos)}
                      className={`
                        relative flex items-center justify-between p-3 rounded-lg border transition-all select-none cursor-pointer active:scale-95
                        bg-[#111827] border-white/5 hover:border-[#38bdf8]/50 hover:bg-[#1f2937]
                      `}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{pos}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className="text-[10px] h-4 px-1 border-white/10 text-gray-400">
                             {data.line}
                           </Badge>
                           <span className="text-xs text-gray-500">{data.time}m ida/v</span>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-[#38bdf8]" />
                    </div>
                   );
                 })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column: Route & Orders */}
          <div className="flex flex-col h-full overflow-hidden bg-[#111827] relative">
            <div className="shrink-0 p-3 px-5 border-b border-[#1f2937] bg-[#111827]/80 backdrop-blur z-10">
              <h3 className="text-[#38bdf8] font-semibold flex items-center gap-2 text-sm uppercase tracking-wider">
                <ListOrdered className="w-4 h-4" />
                2. Ruta y Órdenes
              </h3>
            </div>
            
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full w-full" type="always">
                <div className="p-4 pb-32 md:pb-4">
                  {route.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-500 text-sm gap-3 opacity-40 border-2 border-dashed border-white/5 rounded-xl m-2">
                      <ListOrdered className="w-10 h-10" />
                      <p>Añade destinos desde el panel izquierdo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-2 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span className="w-8 text-center">#</span>
                        <span className="flex-1">Destino</span>
                        <span className="w-32 text-center">Órdenes</span>
                        <span className="w-8"></span>
                      </div>
                      
                      {/* Start Point */}
                      <div className="flex items-center gap-2 px-2 py-1 opacity-50">
                         <div className="w-8 flex justify-center"><div className="w-2 h-2 rounded-full bg-white/20"></div></div>
                         <span className="text-sm font-mono text-gray-400">CENTRO</span>
                      </div>
                      <div className="ml-6 border-l border-dashed border-white/10 h-4"></div>

                      {route.map((pos, index) => (
                        <div key={`${pos}-${index}`}>
                          <div className="flex items-center gap-2 bg-[#1f2937]/40 p-2 rounded border border-white/5 hover:border-white/10 transition-colors animate-in slide-in-from-right-4 duration-300">
                            <div className="w-8 flex justify-center text-sm font-bold text-[#38bdf8]">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-white text-sm">{pos}</div>
                              <div className="text-[10px] text-gray-400">{getLine(pos)}</div>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="w-32 text-center h-10 bg-[#0f1724] border-white/10 text-white focus-visible:ring-[#38bdf8] font-mono text-lg"
                              value={ordersByIndex[index] || ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => updateOrderCount(index, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                              onClick={() => removeFromRoute(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="ml-6 border-l border-dashed border-white/10 h-4 last:hidden"></div>
                        </div>
                      ))}
                      
                      {/* End Point */}
                      <div className="ml-6 border-l border-dashed border-white/10 h-4"></div>
                      <div className="flex items-center gap-2 px-2 py-1 opacity-50">
                         <div className="w-8 flex justify-center"><div className="w-2 h-2 rounded-full bg-white/20"></div></div>
                         <span className="text-sm font-mono text-gray-400">CENTRO</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Bottom Half: Actions & Results */}
            <div className="shrink-0 border-t border-[#1f2937] bg-[#1a2332] p-5 flex flex-col gap-4 z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
              {result && (
                <div className="bg-[#1a2332] border border-[#38bdf8]/30 rounded-lg p-4 animate-in slide-in-from-bottom-4 duration-300 shadow-xl">
                  <div className="grid grid-cols-3 gap-2 divide-x divide-white/5">
                    <div className="px-2 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Tiempo</div>
                      <div className="text-xl font-bold text-white">{result.totalTime}<span className="text-xs text-gray-500 ml-1 font-normal">min</span></div>
                    </div>
                    <div className="px-2 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Órdenes</div>
                      <div className="text-xl font-bold text-white">{result.totalOrders}</div>
                    </div>
                    <div className="px-2 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Promedio</div>
                      <div className="text-xl font-bold text-[#38bdf8]">{result.average}<span className="text-xs text-gray-500 ml-1 font-normal">min/ord</span></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-mono truncate">
                    {result.path}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={calculate}
                  className="w-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0f1724] font-bold shadow-lg shadow-[#38bdf8]/20 h-12 text-base active:scale-95 transition-transform"
                >
                  <Calculator className="mr-2 w-5 h-5" /> Calcular
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={reset}
                  className="w-full border-white/10 text-gray-400 hover:text-white hover:bg-white/5 bg-transparent h-10 active:scale-95 transition-transform"
                >
                  <RefreshCw className="mr-2 w-4 h-4" /> Limpiar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
