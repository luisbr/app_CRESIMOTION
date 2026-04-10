import React, {createContext, useContext, useState, useCallback, useMemo} from 'react';

const DiagnosticoFlowContext = createContext({
  isDiagnosticoFlow: false,
  setIsDiagnosticoFlow: (_) => {},
});

export const DiagnosticoFlowProvider = ({children}) => {
  const [isDiagnosticoFlow, setIsDiagnosticoFlow] = useState(false);

  const value = useMemo(() => ({
    isDiagnosticoFlow,
    setIsDiagnosticoFlow,
  }), [isDiagnosticoFlow]);

  return React.createElement(
    DiagnosticoFlowContext.Provider,
    {value},
    children
  );
};

export const useDiagnosticoFlow = () => useContext(DiagnosticoFlowContext);
