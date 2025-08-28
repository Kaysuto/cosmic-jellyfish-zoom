import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ContrastTestProps {
  className?: string;
}

export const AccessibilityTest: React.FC<ContrastTestProps> = ({ className }) => {
  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Test d'Accessibilité - Contrastes</CardTitle>
          <CardDescription>
            Vérification des contrastes de couleurs selon les standards WCAG 2.1
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test des boutons */}
          <div className="space-y-2">
            <h3 className="font-semibold">Boutons</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Bouton Principal</Button>
              <Button variant="outline">Bouton Contour</Button>
              <Button variant="secondary">Bouton Secondaire</Button>
              <Button variant="ghost">Bouton Fantôme</Button>
                             <Button variant="link">Bouton Lien</Button>
               <Button variant="highContrast">Contraste Élevé</Button>
               <Button variant="blueEnhanced">Bleu Amélioré</Button>
            </div>
          </div>

          {/* Test des inputs */}
          <div className="space-y-2">
            <h3 className="font-semibold">Champs de saisie</h3>
            <div className="space-y-2">
              <Input placeholder="Placeholder avec contraste amélioré" />
              <Input 
                type="email" 
                placeholder="email@exemple.com"
                className="border-2"
              />
              <Input 
                type="password" 
                placeholder="Mot de passe"
                className="border-2"
              />
            </div>
          </div>

          {/* Test des textes */}
          <div className="space-y-2">
            <h3 className="font-semibold">Textes</h3>
            <div className="space-y-1">
              <p className="text-foreground">Texte principal avec contraste optimal</p>
              <p className="text-muted-foreground">Texte secondaire avec contraste amélioré</p>
              <p className="text-primary font-semibold">Texte primaire avec contraste élevé</p>
            </div>
          </div>

                     {/* Informations WCAG */}
           <div className="mt-6 p-4 bg-muted rounded-lg">
             <h4 className="font-semibold mb-2">Standards WCAG 2.1</h4>
             <ul className="text-sm space-y-1 text-muted-foreground">
               <li>• Contraste normal : minimum 4.5:1</li>
               <li>• Contraste large : minimum 3:1</li>
               <li>• Texte décoratif : pas de contraste requis</li>
               <li>• Interface utilisateur : minimum 3:1</li>
             </ul>
           </div>

           {/* Variantes de boutons */}
           <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
             <h4 className="font-semibold mb-2 text-primary">Variantes de Boutons</h4>
             <ul className="text-sm space-y-1 text-muted-foreground">
               <li>• <strong>default</strong> : Bleu classique avec texte blanc</li>
               <li>• <strong>blueEnhanced</strong> : Bleu avec ombres et bordures pour contraste optimal</li>
               <li>• <strong>highContrast</strong> : Contraste maximal (noir/blanc)</li>
               <li>• <strong>outline</strong> : Contour avec bordures épaisses</li>
             </ul>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityTest;
