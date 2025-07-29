'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2, Computer } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      router.push('/');
    } catch (error: any) {
      console.error('Error signing up:', error);
      let description = 'Ocurrió un error inesperado. Por favor, intente de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está registrado. Por favor, inicie sesión.';
      } else if (error.code === 'auth/weak-password') {
        description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      }
      toast({
        title: 'Error de Registro',
        description: description,
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
          <CardTitle className="text-2xl font-headline">Crear Cuenta</CardTitle>
          <CardDescription>Regístrese para acceder al sistema</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SISGEMI JAD Matamoros Planta II. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
