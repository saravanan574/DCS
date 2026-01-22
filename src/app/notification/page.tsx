"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getItems } from "@/lib/actions";
import { Loader2Icon, MapPin } from "lucide-react";
import { useRouter } from 'next/navigation';

interface Notification {
  urgent: string;
  _id: string;
  message: string;
  type: string;
  bloodGroup?: string;
  organType?: string;
  deadline: string;
  hospital: string;
  contact: string;
  email: string;
  location: string;
  createdAt: string;
  bloodRequestId?: string;
}

const getTimeRemaining = (deadline: string) => {
  const total = new Date(deadline).getTime() - new Date().getTime();
  const hours = Math.floor(total / (1000 * 60 * 60));
  return { total, hours };
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Notification[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await getItems("notifications", token);
        const oneDayMs = 24 * 60 * 60 * 1000;

        const filtered = res.filter((n: Notification) => {
          const createdTime = new Date(n.createdAt).getTime();
          const ageMs = Date.now() - createdTime;

          const urgent = n.urgent === "High";
          const deadlineHours = (new Date(n.deadline).getTime() - Date.now()) / 3600000;
          const deadlineClose = deadlineHours < 24 && deadlineHours > 0;

          return ageMs <= oneDayMs || urgent || deadlineClose;
        });

        const sorted = filtered.sort((a: Notification, b: Notification) => {
          const score = (req: Notification) => {
            const bloodMatch = req.bloodGroup === user?.bloodGroup ? 50 : 0;
            const cityMatch = req.location === user?.city ? 30 : 0;
            const rareGroups = ["O-", "B-", "A-", "AB-"];
            const rareBonus = rareGroups.includes(req.bloodGroup || "") ? 20 : 0;

            const hoursLeft = (new Date(req.deadline).getTime() - Date.now()) / 3600000;
            const deadlineScore = hoursLeft > 48 ? 10 : hoursLeft > 24 ? 25 : 40;

            const ageHours = (Date.now() - new Date(req.createdAt).getTime()) / 3600000;
            const newPostScore = ageHours < 6 ? 20 : ageHours < 24 ? 10 : 0;

            return bloodMatch + cityMatch + rareBonus + deadlineScore + newPostScore;
          };

          return score(b) - score(a);
        });

        setRequests(sorted);
        setLoading(true);
      } catch (err) {
        console.log("Error loading notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  const getBadge = (hours: number) => {
    if (hours > 48) return { text: `${Math.ceil(hours / 24)} days left`, color: "bg-green-500" };
    if (hours > 24) return { text: `${Math.ceil(hours / 24)} day left`, color: "bg-yellow-400" };
    if (hours > 0) return { text: `${hours} hours left`, color: "bg-red-500 animate-pulse" };
    return { text: "Expired", color: "bg-gray-500" };
  };

  if (!loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 p-6">
      <h2 className="text-2xl text-red-500 font-bold mb-4">Notifications</h2>

      <div className="space-y-3">
        {requests.map((req) => {
          const { total, hours } = getTimeRemaining(req.deadline);
          const badge = getBadge(hours);

          const sameBlood = req.bloodGroup === user?.bloodGroup;
          const sameCity = req.location === user?.city;

          let matchText = "No Match";
          let matchColor = "bg-gray-400";

          if (sameBlood && sameCity) {
            matchText = "Perfect Match (Blood + Location)";
            matchColor = "bg-purple-600";
          } else if (sameBlood) {
            matchText = "Matched by Blood";
            matchColor = "bg-green-500";
          } else if (sameCity) {
            matchText = "Matched by Location";
            matchColor = "bg-blue-500";
          }

          const isOpen = expandedId === req._id;

          return (
            <div
              key={req._id}
              className="bg-white p-4 border rounded-lg shadow cursor-pointer transition"
              onClick={() => setExpandedId(isOpen ? null : req._id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{req.type || "Request"}
                    {user?.role === "donor" && (
                      <p className={`text-xs m-1 px-2 py-1 rounded text-white inline-block ${matchColor}`}>
                        {matchText}
                      </p>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 font-bold p-1">
                    Urgency:
                    <span className={`text-xs ml-2 px-2 py-1 rounded bg-${req.urgent === "High" ? "red" : "green"}-500 text-white`}>
                      {req.urgent}
                    </span>
                  </p>
                </div>

                <span className={`text-white text-xs px-2 py-1 rounded-full ${badge.color}`}>
                  {badge.text}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 text-sm mt-1">
                <div className="flex items-center px-2 py-1 rounded gap-2 bg-blue-500 text-white">
                  <MapPin size="12" />
                  {req.location}
                </div>
                <span className="ml-2">{req.message?.slice(0, 60)}...</span>
              </div>

              {isOpen && (
                <div className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-2 pb-2">
                  <div>
                    <p><b>Hospital:</b> {req.hospital}</p>
                    <p><b>Location:</b> {req.location}</p>
                    <p><b>Contact:</b> {req.contact}</p>
                    <p><b>Email:</b> {req.email}</p>
                    <p><b>Deadline:</b> {new Date(req.deadline).toLocaleString()}</p>
                  </div>

                  {total > 0 ? (
                    <Link
                      href={`/request/${req.bloodRequestId || req._id}`}
                      className="block bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-lg font-medium"
                    >
                      ✅ Donate / View Full Details
                    </Link>
                  ) : (
                    <button disabled className="block bg-gray-400 text-white w-full py-2 rounded-lg font-medium">
                      Request Expired
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
