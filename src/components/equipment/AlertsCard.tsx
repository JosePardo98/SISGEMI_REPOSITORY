import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing } from "lucide-react";

export default function AlertsCard() {
  const alerts = [
    "Mantenimiento Correctivo Impresora de PIAS",
    "Mantenimiento a Impresora descompuesta de Servicio Técnico.",
  ];

  return (
    <Card className="bg-accent text-accent-foreground shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-bold">
          <BellRing className="mr-2 h-5 w-5" />
          Alertas de Mantenimientos:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          {alerts.map((alert, index) => (
            <li key={index} className="text-sm">{alert}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
