// context/CRMContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  hydrateCustomersFromSupabase,
  hydrateInteractionsFromSupabase,
  hydrateTasksFromSupabase,
} from '../services/storage';

const CRMContext = createContext(null);

export function CRMProvider({ children }) {
  const [customers, setCustomersRaw] = useState([]);
  const [interactions, setInteractionsRaw] = useState([]);
  const [tasks, setTasksRaw] = useState([]);
  const auth = useAuth();
  const authLoading = auth?.loading ?? true;

  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    async function initData() {
      const [remoteCustomers, remoteInteractions, remoteTasks] = await Promise.all([
        hydrateCustomersFromSupabase(),
        hydrateInteractionsFromSupabase(),
        hydrateTasksFromSupabase(),
      ]);

      if (!isMounted) return;
      setCustomersRaw(remoteCustomers);
      setInteractionsRaw(remoteInteractions);
      setTasksRaw(remoteTasks);
    }

    initData();
    return () => {
      isMounted = false;
    };
  }, [authLoading]);

  function setCustomers(updater) {
    setCustomersRaw(prev =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  }

  function setInteractions(updater) {
    setInteractionsRaw(prev =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  }

  function setTasks(updater) {
    setTasksRaw(prev =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  }

  return (
    <CRMContext.Provider value={{ customers, setCustomers, interactions, setInteractions, tasks, setTasks }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  return useContext(CRMContext);
}
