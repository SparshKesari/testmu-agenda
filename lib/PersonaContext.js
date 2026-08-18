import { createContext, useContext } from "react";

export const PersonaContext = createContext(null);

export const usePersona = () => useContext(PersonaContext);
