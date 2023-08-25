import { ApolloClient, InMemoryCache } from '@apollo/client';

// Créez une instance d'Apollo Client avec l'URL de votre serveur GraphQL
const client = new ApolloClient({
  uri: 'http://localhost:4000/', // Remplacez par l'URL de votre serveur GraphQL
  cache: new InMemoryCache(),
});

export default client;
