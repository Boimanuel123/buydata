"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Agent {
  id: string;
  slug: string;
  businessName: string;
  name: string;
  status: string;
}

export default function TestPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/debug/agents");
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Available Agents</h1>

      {loading ? (
        <p>Loading...</p>
      ) : agents.length === 0 ? (
        <p className="text-gray-600">No agents found</p>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold">{agent.businessName || agent.name}</p>
              <p className="text-sm text-gray-600">Slug: {agent.slug}</p>
              <p className="text-sm text-gray-600">Status: {agent.status}</p>
              {agent.status === "ACTIVATED" && (
                <Link
                  href={`/${agent.slug}`}
                  className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Shop
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
