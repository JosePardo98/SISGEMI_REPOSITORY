import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisteredEquipmentCard() {
  const equipmentTypes = [
    "Computadoras:",
    "Impresoras",
    "Impresoras de Tickets:",
    "Impresoras de Planos:",
  ];

  return (
    <Card className="shadow-lg text-primary-foreground overflow-hidden">
      <CardHeader className="bg-primary">
        <CardTitle className="text-lg font-bold">
          Equipos registrados:
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-primary/70 p-4">
        <ul className="space-y-2 list-disc pl-5">
          {equipmentTypes.map((item, index) => (
            <li key={index} className="text-base font-medium">{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
