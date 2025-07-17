
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { Computer } from 'lucide-react';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error de Autenticación',
        description: 'Las credenciales son incorrectas. Por favor, verifique e intente de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-8 left-8 flex items-center text-foreground">
             <Computer size={32} className="mr-3 text-primary" />
            <h1 className="text-xl md:text-2xl font-headline font-semibold">
            SISGEMI
            </h1>
        </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
          <CardDescription>Acceso al Sistema de Gestión de Mantenimiento</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SISGEMI JAD Matamoros Planta II. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
