"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface Customer {
  id: string;
  name: string;
  slug: string;
  portfolioSize: number;
  tier: string;
}

interface CustomerContextValue {
  customer: Customer | null;
  customers: Customer[];
  setCustomer: (customer: Customer) => void;
  switching: boolean;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomerState] = useState<Customer | null>(null);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/customers").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/customer/active").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([allCustomers, activeCustomer]: [Customer[], Customer | null]) => {
        setCustomers(allCustomers);
        if (activeCustomer) {
          setCustomerState(activeCustomer);
        } else if (allCustomers.length > 0) {
          setCustomerState(allCustomers[0]);
        }
      })
      .catch(() => {});
  }, []);

  const setCustomer = useCallback(
    async (next: Customer) => {
      setSwitching(true);
      try {
        const res = await fetch("/api/customer/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: next.id }),
        });
        if (res.ok) {
          setCustomerState(next);
          router.refresh();
        }
      } finally {
        setSwitching(false);
      }
    },
    [router],
  );

  return (
    <CustomerContext.Provider
      value={{ customer, customers, setCustomer, switching }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx)
    throw new Error("useCustomer must be used within a CustomerProvider");
  return ctx;
}
