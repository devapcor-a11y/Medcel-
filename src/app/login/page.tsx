import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { login } from './actions';
import { AlertCircle } from 'lucide-react';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border shadow-sm">
        <form action={login}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground">
              Ingreso Socios
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              DigiBrain PYME Management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchParams.error && (
              <div className="flex items-center gap-2 border-l-4 border-destructive bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{searchParams.error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@digibrain.com"
                required
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-card"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Ingresar al Panel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
