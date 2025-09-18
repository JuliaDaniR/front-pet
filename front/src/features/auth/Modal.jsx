import { useState } from 'react';
import { login as loginService } from './services/login';
import { registerUser, isValidPassword } from './services/userRegister';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/Dialog';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Label } from '../../shared/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/Tabs';
import { Card, CardContent } from '../../shared/ui/Card';
import { User, Mail, Lock } from 'lucide-react';
import { Logo } from '../../shared/ui/Logo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [selectedRole, setSelectedRole] = useState('OWNER');
  const [isLoading, setIsLoading] = useState(false);

  const roleInfo = {
    OWNER: {
      title: 'Dueño de Mascota',
      description: 'Encuentra cuidadores de confianza para tus mascotas',
      icon: User,
      features: ['Gestionar perfiles de mascotas', 'Reservar servicios', 'Seguimiento GPS en tiempo real', 'Gestionar incidentes']
    },
    SITTER: {
      title: 'Cuidador',
      description: 'Ofrece servicios de cuidado de mascotas de calidad',
      icon: User,
      features: ['Configurar horarios disponibles', 'Gestionar zonas de servicio', 'Recibir reservas', 'Reportar incidentes']
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const data = await loginService(email, password);
      if (data && data.jwToken) {
        localStorage.setItem('token', data.jwToken);
        // Decodificación
        const payload = data.jwToken.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        // Mapeo de decodificación a user
        const user = {
          id: decoded.id,
          email: decoded.sub,
          name: decoded.sub, // Solución temporal para nombre
          role: (decoded.role || '').toLowerCase()
        };
        onLogin(user);
        onClose();
        resetForm();
      } else {
        alert('No se recibió token.');
      }
    } catch (error) {
      alert('Error al iniciar sesión: ' + (error.message || error));
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const userData = {
        login: registerEmail,
        pass1: pass1,
        pass2: pass2,
        role: selectedRole
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        document.querySelector('[value="login"]').click();
        resetForm();
      } else {
        alert('Error en el registro: ' + (result.message || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al registrar usuario: ' + error.message);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRegisterEmail('');
    setPass1('');
    setPass2('');
    setSelectedRole('OWNER');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Logo size={20} className="text-white" />
            </div>
            Bienvenido a PetCare
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline focus:outline-none"
                    onClick={() => alert('Funcionalidad de recuperación de contraseña próximamente.')}
                  >
                    ¿Olvidaste tu contraseña? Haz click aquí
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full" 
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
              <Button
                className="w-full mt-4 bg-accent-cta text-black"
                variant="outline"
                onClick={() => window.location.href = `${API_BASE_URL}/oauth2/authorization/google`}
              >
                Accede con Google
              </Button>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Usuarios de prueba:</p>
                <div className="space-y-1 text-xs">
                  <p>• <strong>Admin:</strong> admin@petcare.com</p>
                  <p>• <strong>Dueño:</strong> owner1@petcare.com</p>
                  <p>• <strong>Cuidador:</strong> sitter1@petcare.com</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="tu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass1">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pass1"
                    type="password"
                    placeholder="••••••••"
                    value={pass1}
                    onChange={(e) => setPass1(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, debe incluir al menos 1 número y 1 mayúscula
                </p>
                {pass1 && !isValidPassword(pass1) && (
                  <p className="text-xs text-red-500">
                    La contraseña no cumple con los requisitos
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass2">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pass2"
                    type="password"
                    placeholder="••••••••"
                    value={pass2}
                    onChange={(e) => setPass2(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {pass2 && pass1 !== pass2 && (
                  <p className="text-xs text-red-500">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Tipo de Usuario</Label>
                <div className="flex flex-row gap-3">
                  {Object.entries(roleInfo).map(([key, info]) => {
                    const Icon = info.icon;
                    return (
                      <Card
                        key={key}
                        className={`flex-1 max-w-[220px] cursor-pointer transition-all ${
                          selectedRole === key ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedRole(key)}
                      >
                        <CardContent className="p-4 h-full">
                          <div className="flex flex-col items-center justify-center h-full gap-1">
                            <div className={`p-2 rounded-full mb-1 flex items-center justify-center ${
                              selectedRole === key ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="w-full text-center">
                              <div className="flex flex-col items-center gap-1 mb-0.5">
                                <h4 className="font-medium text-sm">{info.title}</h4>
                                {/* {selectedRole === key && (
                                  <Badge variant="default" className="text-xs">Seleccionado</Badge>
                                )} */}
                              </div>
                              {/* <p className="text-xs text-muted-foreground mb-1">{info.description}</p>
                              <div className="space-y-0.5">
                                {info.features.map((feature, index) => (
                                  <p key={index} className="text-xs text-muted-foreground">• {feature}</p>
                                ))}
                              </div> */}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Button 
                onClick={handleRegister} 
                className="w-full"
                disabled={
                  isLoading || 
                  !registerEmail || 
                  !pass1 || 
                  !pass2 || 
                  pass1 !== pass2 || 
                  !isValidPassword(pass1) || 
                  !isValidPassword(pass2)
                }
              >
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}