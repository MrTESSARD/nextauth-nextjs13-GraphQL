# Configurer et utiliser NextAuth.js dans le répertoire d'applications Next.js 13

Dans ce didacticiel, je vais vous guider dans la configuration de l'authentification dans votre répertoire d'applications Next.js 13 à l'aide de NextAuth.js . Il convient de noter que même si nous utilisons le package NextAuth dans ce didacticiel, vous utilisez peut-être le package Auth.js au moment où vous lirez ceci, car les bibliothèques sont désormais interchangeables.

Pour l'authentification, nous utiliserons le fournisseur d'informations d'identification, qui nécessite un nom d'utilisateur ou une adresse e-mail et un mot de passe. Tout d'abord, nous allons valider et authentifier les informations d'identification incluses dans le corps de la requête par rapport à notre base de données, qui dans ce cas est PostgreSQL. Cependant, vous pouvez facilement passer à une autre base de données prise en charge par Prisma si nécessaire.

Une fois l'utilisateur authentifié, nous explorerons différentes méthodes pour récupérer et modifier les informations de session, ainsi que la façon de protéger les routes privées dans votre application.

En suivant ce didacticiel, vous acquerrez une solide compréhension de la façon d'implémenter NextAuth.js dans votre répertoire d'applications Next.js 13 pour l'authentification.

Plus d'entraînement:

Next.js – Utilisez des pages de connexion et d’inscription personnalisées pour NextAuth.js
Comment configurer l'API React Context dans le répertoire d'applications Next.js 13
Comment configurer la requête React dans le répertoire d'applications Next.js 13
Comment configurer Redux Toolkit dans le répertoire d'applications Next.js 13
React Query et Axios : enregistrement des utilisateurs et vérification des e-mails
Mots de passe oubliés/réinitialisés avec React Query et Axios
Configurer et utiliser NextAuth.js dans le répertoire d'applications Next.js 13

Table des matières
Configurer le projet Next.js 13
Après avoir terminé ce guide, votre organisation de fichiers et de dossiers ressemblera à celle présentée dans la capture d'écran ci-dessous.

Structure des dossiers et des fichiers du projet de répertoire d'applications NextAuth et Next.js 13
Commencez par choisir un emplacement approprié sur votre machine et ouvrez une fenêtre de terminal dans ce répertoire. À partir de là, vous pouvez démarrer le processus de configuration de votre projet Next.js 13 en exécutant l'une des commandes ci-dessous, en fonction de votre gestionnaire de packages préféré.
yarn create next-app nextauth-nextjs13-prisma
# or
npx create-next-app@latest nextauth-nextjs13-prisma
# or
pnpm create next-app nextauth-nextjs13-prisma

Coquille
Au cours du processus de configuration, vous rencontrerez quelques invites auxquelles vous devrez répondre. Tout d'abord, il vous sera demandé si vous souhaitez activer TypeScript et ESLint ; choisissez « Oui » pour les deux. Ensuite, sélectionnez « Oui » pour les options app/de répertoire expérimental et src/de répertoire. Enfin, vous serez invité à choisir un alias d'importation. Appuyez sur la touche Tab pour sélectionner la première option, puis appuyez sur Entrée.

Après avoir répondu aux invites, le projet sera créé et toutes les dépendances requises seront automatiquement installées. Une fois le processus d'installation terminé, vous êtes prêt à ouvrir le projet dans votre IDE ou éditeur de texte préféré et à commencer à travailler.

Configurer la route de l'API d'authentification suivante
Pour commencer à implémenter la logique d'authentification, nous devrons installer le package NextAuth. Pour l'instant, nous allons installer une version spécifique à partir d'une pull request qui inclut les fonctionnalités supplémentaires dont nous avons besoin pour travailler dans le répertoire de l'application.

Cependant, au moment où vous lisez cet article, cette fonctionnalité devrait avoir été ajoutée à une version bêta ou stable. Pour installer le package NextAuth, choisissez la commande appropriée en fonction de votre gestionnaire de packages et exécutez-la.

```tsx
yarn add next-auth@0.0.0-pr.6777.c5550344
# or 
npm i next-auth@0.0.0-pr.6777.c5550344
# or
pnpm add next-auth@0.0.0-pr.6777.c5550344
```
Coquille
Passons à la définition des options NextAuth. Initialement, nous avons défini et exporté les options NextAuth dans le src/app/api/auth/[...nextauth]/route.tsfichier. Cependant, certains utilisateurs ont rencontré des erreurs d'exportation lors de l'exécution du code. Pour résoudre ce problème, nous pouvons définir et exporter les options NextAuth dans un fichier séparé, tel que le lib/auth.tsfichier . Je n'étais pas au courant de cette solution au départ, mais un développeur nommé Kevin l'a mentionnée dans la section commentaires. Vous pouvez en savoir plus sur les erreurs d'exportation dans les commentaires.

Pour implémenter cette solution, accédez au srcrépertoire et créez un nouveau dossier appelé lib. Dans le libdossier, créez un fichier nommé auth.tset copiez-y le code de configuration NextAuth suivant.
src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in", 
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = { id: "1", name: "Admin", email: "admin@admin.com" };
        return user;
      },
    }),
  ],
};

Manuscrit
Le code ci-dessus illustre le processus de configuration de l'authentification dans une application Next.js 13 à l'aide de la bibliothèque NextAuth. Nous avons d'abord importé le CredentialsProvidermodule, que nous utiliserons pour la validation. Ensuite, nous avons défini un objet appelé ' authOptions ' qui contient la configuration de notre processus d'authentification.

Dans la credentialsclé de la CredentialsProvider()méthode, nous avons répertorié les champs email et mot de passe , qui seront disponibles sur le formulaire de connexion. Pour l'étape d'autorisation, nous utilisons actuellement une simple implémentation fictive qui renvoie un objet utilisateur fixe.

L'étape suivante consiste à créer une route API capable de gérer les demandes d'authentification de NextAuth. Nous utiliserons la NextAuth()méthode pour créer un gestionnaire d'API, puis l'exporterons en tant que fonctions GET et POST à ​​utiliser dans notre application.

Pour commencer, accédez au apirépertoire dans le src/appdossier. Dans le apirépertoire, créez un nouveau dossier appelé auth. Dans le dossier ' auth ', créez un dossier nommé [...nextauth]. Enfin, créez un nouveau fichier nommé route.tsdans le dossier '[…nextauth]' et ajoutez le code fourni ci-dessous.

Lorsque vous copiez et collez l'URL ci-dessous, assurez-vous de retaper manuellement les trois points ( ...) dans [...nextauth]. Ceci est important car WordPress peut automatiquement convertir les trois points en ellipses, même si j'ai utilisé de vrais trois points dans le chemin lors de la création de l'article. Cette conversion automatique peut provoquer des erreurs. Pour éviter tout problème, veuillez vous assurer que les trois points sont représentés avec précision dans le chemin de l'URL.

src/app/api/auth/[…nextauth]/route.ts

import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

Manuscrit
Créer des boutons réutilisables
Pour faciliter la navigation entre les pages de l'application, nous allons créer des boutons au lieu de saisir manuellement les URL dans le navigateur. Commencez par créer un dossier « composants » dans le répertoire « src ». Dans « composants », créez un buttons.component.tsxfichier et ajoutez le code suivant :

src/components/boutons.component.tsx

"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

export const LoginButton = () => {
  return (
    <button style={{ marginRight: 10 }} onClick={() => signIn()}>
      Sign in
    </button>
  );
};

export const RegisterButton = () => {
  return (
    <Link href="/register" style={{ marginRight: 10 }}>
      Register
    </Link>
  );
};

export const LogoutButton = () => {
  return (
    <button style={{ marginRight: 10 }} onClick={() => signOut()}>
      Sign Out
    </button>
  );
};

export const ProfileButton = () => {
  return <Link href="/profile">Profile</Link>;
};

Réagissez à la Bourse de Toronto
Après cela, vous pouvez importer les boutons dans le src/app/page.tsxfichier et les utiliser dans le code JSX pour les afficher dans l'interface utilisateur.

src/app/page.tsx

import {
  LoginButton,
  LogoutButton,
  ProfileButton,
  RegisterButton,
} from "@/components/buttons.component";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <div>
        <LoginButton />
        <RegisterButton />
        <LogoutButton />
        <ProfileButton />
      </div>
    </main>
  );
}

Réagissez à la Bourse de Toronto
Avant de tester le flux d'authentification, nous devons configurer les variables d'environnement requises pour que NextAuth fonctionne correctement. Ces variables incluent un secret pour le chiffrement JWT et l'URL racine de votre application.

Bien qu'il soit possible d'éviter de définir ces variables si vous travaillez uniquement avec une logique côté client, nous devons les définir puisque nous travaillerons avec un rendu côté serveur. Pour définir ces variables, créez un .envfichier dans le répertoire racine et ajoutez-y les variables d'environnement suivantes.

.env

NEXTAUTH_SECRET=my_ultra_secure_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

Javascript
Après avoir terminé la configuration de base, il est important d’apporter un petit ajustement au src/app/layout.tsxfichier. La suppression de la import "./globals.css";ligne est nécessaire pour empêcher l'application du code CSS fourni avec Next.js 13.

Une fois cet ajustement effectué, vous pouvez démarrer le serveur de développement pour construire le projet et visiter http://localhost:3000/pour accéder à l'application. Depuis la page d'accueil, vous pouvez cliquer sur le bouton « se connecter ». Si vous êtes correctement redirigé vers la page de connexion NextAuth par défaut, vous êtes prêt à continuer.

Sur la page de connexion, entrez votre e-mail et votre mot de passe et cliquez sur le bouton pour soumettre les données du formulaire au point de terminaison de l'API. Puisque nous utilisons une autorisation fictive, vous pouvez saisir n’importe quel e-mail et mot de passe aléatoires. Une fois l'authentification réussie, vous serez redirigé vers la page d'accueil.

page de connexion nextauth par défaut
Pour visualiser les cookies envoyés par NextAuth, vous pouvez ouvrir l'onglet Application de l'outil de développement de votre navigateur et cliquer sur http://localhost:3000/dans la section Cookies.

Ici, vous verrez divers cookies, y compris le jeton de session que NextAuth utilise pour l'authentification. Un autre cookie que vous verrez est le jeton CSRF, qui est une fonctionnalité de sécurité utilisée par NextAuth pour empêcher les attaques de falsification de requêtes intersites. Enfin, vous trouverez également un cookie d'URL de rappel, crucial pour NextAuth pour rediriger les utilisateurs vers la bonne page après authentification.

Cookies envoyés par NextAuth
Trois façons d'obtenir les données de session NextAuth
Maintenant que l'authentification est terminée, nous avons besoin d'un moyen d'accéder aux données de session pour les utiliser. Il existe trois emplacements où nous pouvons obtenir les données de session. Le premier est côté serveur dans un composant serveur React, le second est également côté serveur dans n'importe quelle route API et le dernier est côté client. Cela implique que deux des emplacements sont côté serveur et un côté client.

Dans la dernière version de NextAuth, l'obtention des informations de session côté serveur est devenue beaucoup plus facile, mais leur acquisition côté client demande un peu de préparation.

Obtenez la session dans un composant serveur
Montrons maintenant comment récupérer les informations de session côté serveur à l'aide d'un composant serveur React. Cela peut être fait en appelant la getServerSessionfonction et en fournissant l'objet ' authOptions ' qui a été exporté à partir du lib/auth.tsfichier lors de la configuration de NextAuth.

Pour implémenter cela, remplacez simplement le contenu de src/app/page.tsxpar l'extrait de code ci-dessous. Une fois que vous avez fait cela, démarrez le serveur de développement Next.js et accédez à http://localhost:3000/pour afficher la sortie des données de session à l'écran.

src/app/page.tsx
import {
  LoginButton,
  LogoutButton,
  ProfileButton,
  RegisterButton,
} from "@/components/buttons.component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <div>
        <LoginButton />
        <RegisterButton />
        <LogoutButton />
        <ProfileButton />

        <h1>Server Session</h1>
        <pre>{JSON.stringify(session)}</pre>
      </div>
    </main>
  );
}

Réagissez à la Bourse de Toronto
Obtenez la session dans une route API
Passons à la récupération des données de session dans une route API, qui fonctionne également sur le serveur. Pour ce faire, nous utiliserons la getServerSessionfonction et fournirons le authOptionspour acquérir les données de session.

Créez un route.tsfichier dans un nouveau répertoire « session » dans le src/app/apidossier. Voici le code à inclure :

src/app/api/session/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    authenticated: !!session,
    session,
  });
}

Manuscrit
Une fois que vous avez terminé, accédez http://localhost:3000/api/sessionet vous trouverez les données de session imprimées à l'écran dans un objet JSON.

Données de session NextAuth pour l'autorisation simulée
Obtenez la session dans un composant client
Enfin, passons à la récupération des données de session dans un composant côté client. Pour cela, NextAuth nécessite la configuration d'un fournisseur de session côté client. Une fois que le fournisseur est en place et enveloppe votre application, vous pouvez utiliser un hook côté client appelé useSessionpour obtenir les informations de session.

Étant donné que le client ne peut pas décoder le jeton Web JSON (JWT) par lui-même, le useSessionhook envoie une requête HTTP au serveur pour récupérer les informations de session. Le serveur décode le JWT et le renvoie, et NextAuth stocke les données de session dans le fournisseur, auxquelles le useSessionhook peut ensuite accéder.

Il convient de noter qu'une certaine latence peut être ajoutée lors de la première demande de session, car le serveur doit décoder le JWT. Mais une fois les données stockées chez le fournisseur, les demandes ultérieures seront rapides et transparentes.

Pour créer le fournisseur de session, créez simplement un providers.tsxfichier dans le répertoire « src/app » et ajoutez le code suivant.

src/app/providers.tsx

"use client";

import { SessionProvider } from "next-auth/react";

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};

Réagissez à la Bourse de Toronto
Après avoir créé le fournisseur de session, enveloppez-le {children}dans le src/app/layout.tsxfichier afin que tous les composants côté client puissent accéder aux données de session. Voici le code que vous pouvez utiliser :

src/app/layout.tsx

import { NextAuthProvider } from "./providers";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}

Réagissez à la Bourse de Toronto
Maintenant, nous allons créer un nouveau composant qui nous permettra d'utiliser le useSessionhook pour récupérer les données de session et les afficher côté client. Tout d’abord, accédez au répertoire « composants » et créez un nouveau fichier nommé user.component.tsx. Ensuite, collez le code suivant dans le nouveau fichier.

src/components/user.component.tsx

"use client";

import { useSession } from "next-auth/react";

export const User = () => {
  const { data: session } = useSession();

  return (
    <>
      <h1>Client Session</h1>
      <pre>{JSON.stringify(session)}</pre>
    </>
  );
};

Réagissez à la Bourse de Toronto
Pour afficher les informations de session de l'utilisateur sur la page, nous devons importer le Usercomposant src/app/page.tsxet l'inclure dans le code JSX.

src/app/page.tsx

import {
  LoginButton,
  LogoutButton,
  ProfileButton,
  RegisterButton,
} from "@/components/buttons.component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/components/user.component";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <div>
        <LoginButton />
        <RegisterButton />
        <LogoutButton />
        <ProfileButton />

        <h1>Server Session</h1>
        <pre>{JSON.stringify(session)}</pre>

        <User />
      </div>
    </main>
  );
}

Réagissez à la Bourse de Toronto
Lorsque vous visitez la page d'accueil et actualisez le navigateur, vous remarquerez que les données de session affichées dans le composant du serveur React apparaissent instantanément. Cependant, les données de session affichées dans le composant côté client mettent un peu plus de temps à apparaître puisque le client doit faire une requête HTTP au serveur pour décoder le JWT.

Intégrer une base de données
Avec une compréhension approfondie du processus d'authentification, il est temps d'intégrer une base de données pour vérifier l'identité des utilisateurs au lieu d'utiliser un objet codé en dur. Cela implique de rechercher les informations de l'utilisateur et de vérifier son mot de passe haché par rapport à celui stocké dans la base de données.

Configurer PostgreSQL
Ici, nous allons configurer un serveur PostgreSQL à l'aide de Docker. Pour ce faire, vous pouvez créer un docker-compose.ymlfichier et ajouter les configurations Docker Compose suivantes.

docker-compose.yml

version: '3'
services:
  postgres:
    image: postgres:latest
    container_name: postgres
    ports:
      - '6500:5432'
    volumes:
      - progresDB:/var/lib/postgresql/data
    env_file:
      - ./.env
volumes:
  progresDB:

Javascript
Il est maintenant temps de configurer le .envfichier avec les variables d'environnement nécessaires pour l'image Postgres Docker. Une fois que vous les avez ajoutés, exécutez docker-compose up -dpour démarrer le serveur Postgres dans le conteneur Docker.

.env

NEXTAUTH_SECRET=my_ultra_secure_nextauth_secret
NEXTAUTH_URL=http://localhost:3000


POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=6500
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=nextauth_prisma

DATABASE_URL=postgresql://admin:password123@localhost:6500/nextauth_prisma?schema=public

Javascript
Configurer Prisma ORM
Passons à la configuration de Prisma pour nous permettre de communiquer avec la base de données Postgres. Tout d'abord, ouvrez votre terminal et installez les dépendances nécessaires en exécutant les commandes suivantes en fonction de votre gestionnaire de packages.

yarn add @prisma/client bcryptjs && yarn add -D ts-node prisma @types/bcryptjs
# or
npm i @prisma/client bcryptjs && npm i -D ts-node prisma @types/bcryptjs
# or 
pnpm add @prisma/client bcryptjs && pnpm add -D ts-node prisma @types/bcryptjs

Coquille
Pour configurer Prisma et vous connecter à votre base de données Postgres, exécutez la commande suivante pour initialiser Prisma dans votre projet et créer une source de données pour Postgres dans le prisma/schema.prismafichier :

yarn prisma init --datasource-provider postgresql
# or
npx prisma init --datasource-provider postgresql
# or
pnpm prisma init --datasource-provider postgresql

Coquille
Vous devrez maintenant créer un modèle utilisateur dans votre prisma/schema.prismafichier. Vous pouvez utiliser le code ci-dessous comme référence ou créer le vôtre.

prisma/schéma.prisma

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id       String @id @default(uuid())
  name     String
  email    String @unique
  password String
}

Javascript
NextAuth ne fournit pas de moyen intégré pour gérer l'enregistrement des utilisateurs, car cela n'est pas nécessaire pour certaines méthodes d'authentification telles que les liens magiques, la connexion par courrier électronique ou OAuth. Cependant, lors de l'utilisation de l'authentification par identifiant, il est nécessaire de créer d'abord un compte utilisateur, généralement via une page d'inscription.

Dans ce didacticiel, pour gagner du temps, nous allons ensemencer la base de données avec un compte utilisateur test plutôt que de mettre en œuvre un flux d'inscription. Notez que nous reviendrons sur l’inscription des utilisateurs à la fin de ce tutoriel.

Pour commencer, créez un seed.tsfichier dans le prismarépertoire et copiez-y le code suivant.

prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "Admin",
      password,
    },
  });
  console.log({ user });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

Manuscrit
Pour nous permettre d'amorcer facilement la base de données avec un utilisateur test, nous ajouterons un script au package.jsonfichier. Ouvrez le package.jsonfichier et ajoutez le script suivant :

package.json

{
"prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
}

JSON
Une fois Prisma configuré, il est temps de générer les scripts de migration et de transférer le schéma vers la base de données PostgreSQL. Pour créer les fichiers de migration, exécutez la commande npx prisma migrate dev --name init. Cette commande générera non seulement les fichiers de migration Prisma mais créera également le client Prisma dans le node_modulesdossier.

Après avoir généré les fichiers de migration, utilisez la commande npx prisma db seedpour ajouter l'utilisateur test à la base de données.

Ensuite, nous allons créer une PrismaClientinstance globale à l'aide du @prisma/clientpackage, qui nous permettra de communiquer avec la base de données PostgreSQL. Pour ce faire, nous devons créer un fichier nommé prisma.tsdans le répertoire « lib » et y ajouter le code suivant.

src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

Manuscrit
Implémenter le code d'authentification NextAuth
Une fois Prisma et Postgres configurés, implémentons la logique d'authentification. Dans la route API, remplacez le code existant par le code mis à jour ci-dessous. Nous avons apporté des modifications à la async authorize(credentials) {}fonction pour vérifier d'abord si les informations d'adresse e-mail et de mot de passe étaient incluses dans le corps de la demande.

Ensuite, nous récupérons l'utilisateur avec l'adresse e-mail fournie et utilisons Bcrypt pour vérifier son mot de passe par rapport à celui haché. L'objet utilisateur est renvoyé une fois la vérification réussie.

src/lib/auth.ts

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !(await compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          randomKey: "Hey cool",
        };
      },
    }),
  ],
};

Manuscrit
Après avoir modifié les options de configuration de NextAuth, si vous rencontrez une erreur dans le navigateur, cela peut indiquer que Next.js tente d'inclure le module Bcrypt dans le bundle client, ce qui n'est pas nécessaire puisque nous l'utilisons uniquement sur le serveur.

Pour éviter que certains packages soient inclus dans le bundle client, nous pouvons ajouter leurs noms au serverComponentsExternalPackagestableau dans la clé ' experimental ' du fichier next.config.js . Dans ce cas, nous devons ajouter @prisma/clientet bcryptjsau tableau. Voici un exemple de code pour le fichier next.config.js :

suivant.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"]
  },
}

module.exports = nextConfig

Javascript
Maintenant que nous avons intégré la base de données dans le processus d'authentification, toute tentative de connexion avec un e-mail ou un mot de passe incorrect entraînera une erreur. Pour vous connecter avec succès, vous devrez utiliser les informations de connexion de l'utilisateur test que nous avons précédemment insérées dans la base de données.

Obtenez une erreur lorsque vous essayez un e-mail ou un mot de passe
Stocker les clés personnalisées dans le JWT
Vous avez peut-être remarqué que lorsque nous avons imprimé l'objet de session dans les composants serveur et client React, l'ID de l'utilisateur était manquant. Cela pourrait être frustrant si vous souhaitez l’utiliser ultérieurement pour d’autres tâches. Heureusement, NextAuth fournit deux rappels pratiques – jwtet session– qui nous permettent d'ajouter nos propres informations personnalisées à l'objet de session.

Pour ajouter vos clés personnalisées, vous pouvez modifier ces deux rappels dans la callbackspropriété de la configuration NextAuth. De cette façon, vous pouvez inclure les informations dont vous avez besoin dans l'objet de session et dans JWT, et y accéder à tout moment et n'importe où dans votre application.

src/lib/auth.ts

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !(await compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          randomKey: "Hey cool",
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      console.log("Session Callback", { session, token });
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      console.log("JWT Callback", { token, user });
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
  },
};

Manuscrit
J'ai ajouté le randomKeyà la configuration simplement pour démontrer que toute information supplémentaire peut être incluse dans la session. Il n’a pas d’objectif ou de fonctionnalité spécifique dans le code. Son objectif est uniquement d'illustrer la flexibilité d'inclure des données ou des variables personnalisées dans la session.

Vous souhaitez voir les clés personnalisées que vous avez ajoutées à l'objet de session ? Suivez simplement ces étapes : accédez à la page d'accueil et déconnectez-vous en cliquant sur le bouton « Se déconnecter ». Connectez-vous ensuite à nouveau et vous remarquerez que les clés personnalisées sont désormais incluses dans l'objet de session imprimé dans les composants serveur et client. De plus, vous pouvez afficher les clés arbitraires en visitant la http://localhost:3000/api/sessionroute API que nous avons créée précédemment.

Voir les clés personnalisées dans l'objet de session
Différentes façons de protéger les routes
Nous avons presque terminé le didacticiel et nous avons vu comment ajouter des informations personnalisées à l'objet de session NextAuth. L'un des éléments les plus cruciaux de tout système d'authentification consiste à protéger certains itinéraires, qu'il s'agisse d'une section entière de votre application, d'une seule page ou d'un point de terminaison d'API. Dans Next.js, il existe quatre manières principales d'implémenter la protection des routes : dans un composant serveur, dans un composant client, dans une route API ou à l'aide d'un middleware.

Bien que les quatre méthodes soient possibles, il est généralement recommandé d'utiliser une protection ou un middleware côté serveur. Nous examinerons ces approches sous peu.

Protection des routes côté client
La première façon d'implémenter des routes protégées consiste à utiliser le useSessionhook dans un composant côté client pour charger la session. Cette approche est similaire à ce que nous avons vu précédemment, mais cette fois nous ajouterons une onUnauthenticated()méthode à l'objet passé au hook, qui sera appelée lorsque l'utilisateur n'est pas connecté.

Gardez à l'esprit que la première fois que ce hook est appelé, il peut y avoir une certaine latence car il doit décoder le côté serveur JWT et récupérer les informations de session. Dans la onUnauthenticated()méthode, nous pouvons ajouter la logique pour rediriger l'utilisateur vers la page de connexion s'il n'est pas connecté.

Pour voir cela en action, créons un nouveau dossier appelé « profile » dans le répertoire « src/app ». Dans le dossier « profile », créez un page.tsxfichier et ajoutez le code suivant. Cette page servira de page privée à laquelle seuls les utilisateurs authentifiés pourront accéder. Une fois l'utilisateur authentifié, une liste d'utilisateurs s'affichera.

src/app/profile/page.tsx

"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { cache, use } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

const getUsers = cache(() =>
  fetch("https://jsonplaceholder.typicode.com/users").then((res) => res.json())
);

export default function Profile() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin");
    },
  });

  if (status === "loading") {
    return <p>Loading....</p>;
  }

  let users = use<User[]>(getUsers());

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {users.map((user) => (
          <div
            key={user.id}
            style={{ border: "1px solid #ccc", textAlign: "center" }}
          >
            <img
              src={`https://robohash.org/${user.id}?set=set2&size=180x180`}
              alt={user.name}
              style={{ height: 180, width: 180 }}
            />
            <h3>{user.name}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}

Réagissez à la Bourse de Toronto
Pour tester cette fonctionnalité, revenez à la page d'accueil et déconnectez-vous. Ensuite, essayez d'accéder à la page de profil sur http://localhost:3000/profile. Vous serez immédiatement redirigé vers la page de connexion. Cependant, il y aura une brève période de chargement car le useSessionhook doit envoyer une requête HTTP au serveur pour décoder le JWT.

Après avoir reçu le résultat du serveur, il vérifiera si vous disposez d'une session valide. Si vous ne le faites pas, cela déclenchera la onUnauthenticated()méthode, qui à son tour appellera la redirect()fonction pour vous rediriger vers la page de connexion.

Protection des routes côté serveur
La méthode suivante pour implémenter des routes protégées consiste à utiliser un composant serveur React. Cette approche est relativement simple, car nous utiliserons la getServerSessionfonction pour récupérer les informations de session, puis utiliserons une ifinstruction pour vérifier si la session a été récupérée avec succès. Si l'utilisateur n'est pas connecté, nullil sera renvoyé et nous pourrons le rediriger vers la page de connexion.

Pour voir cela en action, accédez au src/app/profile/page.tsxfichier et remplacez son contenu par le code fourni ci-dessous.

src/app/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
};

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const users: User[] = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  ).then((res) => res.json());

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {users.map((user) => (
          <div
            key={user.id}
            style={{ border: "1px solid #ccc", textAlign: "center" }}
          >
            <img
              src={`https://robohash.org/${user.id}?set=set2&size=180x180`}
              alt={user.name}
              style={{ height: 180, width: 180 }}
            />
            <h3>{user.name}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}

Réagissez à la Bourse de Toronto
Pour tester cette approche, assurez-vous que vous êtes déconnecté de votre compte sur la page d'accueil. Ensuite, essayez à nouveau d’accéder à la page de profil. Vous serez redirigé vers la page de connexion, mais contrairement à l'approche précédente, il n'y aura pas de période de chargement. En effet, le composant serveur vérifie immédiatement si l'utilisateur est authentifié avant de diffuser la page. Cela crée une expérience utilisateur transparente et sécurisée.

Protéger une route API
L'approche suivante consiste à protéger une route API, et elle est également simple car nous avons déjà accès à la session côté serveur. Pour y parvenir, nous pouvons utiliser la getServerSessionfonction pour obtenir les informations de session et vérifier si elles existent. Si ce n'est pas le cas, nous pouvons renvoyer une erreur non autorisée avec le message « Vous n'êtes pas connecté ».

src/app/api/session/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: !!session,
    session,
  });
}

Manuscrit
Pour tester cette approche, déconnectez-vous d'abord de votre compte sur la page d'accueil. Ensuite, visitez la route API sur http://localhost:3000/api/session. Si vous n'êtes pas connecté, vous devriez voir une erreur non autorisée envoyée par le serveur, qui comprend un message indiquant « Vous n'êtes pas connecté ». Cela confirme que la route API est correctement protégée et que les utilisateurs non autorisés ne peuvent pas y accéder.

Réponse non autorisée de la route API Next.js
Protection des routes middleware
L’approche finale et la plus préférable pour protéger les routes consiste à utiliser un middleware. C'est la meilleure méthode car elle vous permet de protéger un sous-répertoire entier ou toutes les pages de votre application, plutôt que d'ajouter une logique de protection de routage à chaque page individuelle.

Pour protéger toutes les pages de votre application Next.js avec NextAuth, vous pouvez simplement créer un middleware.tsfichier dans votre srcrépertoire et exporter le wrapper middleware par défaut fourni par NextAuth à l'aide de la ligne de code suivante :

src/middleware.ts

export { default } from "next-auth/middleware";

Manuscrit
Si vous devez protéger une ou plusieurs pages, ou des routes API, vous pouvez exporter un objet de configuration avec une matcherclé. Il matchers'agit d'un tableau pouvant contenir les routes que vous souhaitez protéger. Dans le code ci-dessous, nous avons ajouté "/((?!register|api|login).*)"au matchertableau. Cela garantit que toute route autre que celles des répertoires register , login et api sera protégée.

src/middleware.ts

export { default } from "next-auth/middleware";

export const config = {
  // matcher: ["/profile"],
  matcher: ["/((?!register|api|login).*)"],
};

Manuscrit
Pour finaliser la configuration, accédez au src/app/profile/page.tsxfichier et supprimez la logique de protection des routes, car nous utilisons désormais l'approche middleware pour la protection des routes. Une fois déconnecté, essayez d’accéder à la page de profil. En cas de succès, vous devriez être redirigé vers la page de connexion, confirmant que le middleware protège efficacement l'itinéraire.

src/app/profile/page.tsx

type User = {
  id: number;
  name: string;
  email: string;
};

export default async function Profile() {
  const users: User[] = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  ).then((res) => res.json());

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {users.map((user) => (
          <div
            key={user.id}
            style={{ border: "1px solid #ccc", textAlign: "center" }}
          >
            <img
              src={`https://robohash.org/${user.id}?set=set2&size=180x180`}
              alt={user.name}
              style={{ height: 180, width: 180 }}
            />
            <h3>{user.name}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}

Réagissez à la Bourse de Toronto
Implémenter la logique d'enregistrement de compte
Après avoir découvert NextAuth, l'étape suivante consiste à implémenter la logique d'enregistrement des utilisateurs. Bien que NextAuth fournisse une fonctionnalité d'authentification, il n'inclut pas de solution intégrée pour l'enregistrement des utilisateurs.

Créer la route API pour enregistrer les utilisateurs
Créons maintenant une route API pour gérer l'enregistrement des utilisateurs. Nous définirons un gestionnaire de route qui extrait les informations d'identification de l'utilisateur du corps de la requête, hache le mot de passe et enregistre l'utilisateur dans la base de données à l'aide de Prisma.

Pour ce faire, accédez au src/app/apirépertoire et créez un nouveau sous-répertoire appelé « registre ». Dans ce répertoire, créez un route.tsfichier et ajoutez le code suivant :

src/app/api/register/route.ts

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as {
      name: string;
      email: string;
      password: string;
    };
    const hashed_password = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed_password,
      },
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: "error",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}

Manuscrit
Créer le composant de formulaire
Maintenant que la logique API est en place, créons un composant de formulaire pour l'enregistrement des utilisateurs. Puisque nous allons gérer le formulaire à l’aide de hooks et d’événements DOM, il est important de s’assurer que ce composant n’est rendu que dans le navigateur. Vous pouvez y parvenir en ajoutant le "use client";drapeau en haut du fichier.

Le formulaire d'inscription permettra aux utilisateurs de saisir leurs informations d'inscription et de les soumettre à l'API. Pour commencer, créez un répertoire « register » dans le répertoire « src/app ». Ensuite, dans le répertoire ' register ', créez un fichier appelé form.tsx. Ce fichier contiendra le code du formulaire d'inscription.

src/app/register/form.tsx

"use client";

import { signIn } from "next-auth/react";
import { ChangeEvent, useState } from "react";

export const RegisterForm = () => {
  let [loading, setLoading] = useState(false);
  let [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(formValues),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoading(false);
      if (!res.ok) {
        alert((await res.json()).message);
        return;
      }

      signIn(undefined, { callbackUrl: "/" });
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      alert(error.message);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        width: 500,
        rowGap: 10,
      }}
    >
      <label htmlFor="name">Name</label>
      <input
        required
        type="text"
        name="name"
        value={formValues.name}
        onChange={handleChange}
        style={{ padding: "1rem" }}
      />
      <label htmlFor="email">Email</label>
      <input
        required
        type="email"
        name="email"
        value={formValues.email}
        onChange={handleChange}
        style={{ padding: "1rem" }}
      />
      <label htmlFor="password">Password</label>
      <input
        required
        type="password"
        name="password"
        value={formValues.password}
        onChange={handleChange}
        style={{ padding: "1rem" }}
      />
      <button
        style={{
          backgroundColor: `${loading ? "#ccc" : "#3446eb"}`,
          color: "#fff",
          padding: "1rem",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "loading..." : "Register"}
      </button>
    </form>
  );
};

Réagissez à la Bourse de Toronto
Créer la page d'enregistrement du compte
Pour compléter la fonction d'inscription, nous devons créer une page qui affichera le formulaire d'inscription. Dans le src/app/registerrépertoire, créez un fichier appelé page.tsx. Dans ce fichier, importez le composant Register que nous avons créé précédemment et utilisez-le dans JSX pour le restituer sur la page.

src/app/register/page.tsx

import { RegisterForm } from "./form";

export default function RegisterPage() {
  return (
    <div
      style={{
        display: "flex",
        height: "70vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h1>Register</h1>
        <RegisterForm />
      </div>
    </div>
  );
}

Réagissez à la Bourse de Toronto
Après avoir terminé la configuration, accédez à la page d'inscription à l'adresse http://localhost:3000/registerpour créer un nouveau compte.

Formulaire d'enregistrement de compte
Après avoir terminé avec succès le processus d'inscription, vous serez redirigé vers la page de connexion NextAuth par défaut. Là, vous devez vous connecter en utilisant les mêmes informations d'identification que vous avez utilisées lors de la création du compte. Une fois connecté, NextAuth vous redirigera vers la page d'accueil comme spécifié par la fonction de rappel signIn(undefined, { callbackUrl: "/" })dans le formulaire d'inscription.