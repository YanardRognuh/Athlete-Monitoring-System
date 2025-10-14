// // frontend/src/components/medis/TeamList.jsx
// import { useState, useEffect } from "react";
// import { teamAPI } from "../../services/api";
// import { Users, User, MapPin } from "lucide-react";
// import LoadingSkeleton from "../common/LoadingSkeleton";

// export default function TeamList() {
//   const [teams, setTeams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchTeams();
//   }, []);

//   const fetchTeams = async () => {
//     try {
//       const response = await teamAPI.getAll();
//       setTeams(response.data);
//     } catch (err) {
//       setError("Failed to load teams");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="p-6 bg-white rounded-lg animate-pulse">
//             <div className="w-1/4 h-4 mb-4 bg-gray-200 rounded"></div>
//             <div className="w-1/2 h-3 mb-2 bg-gray-200 rounded"></div>
//             <div className="w-1/3 h-3 bg-gray-200 rounded"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-900">All Teams</h2>
//         <p className="mt-1 text-gray-600">
//           View teams and their coaching staff
//         </p>
//       </div>

//       <div className="grid gap-6">
//         {teams.map((team) => (
//           <div
//             key={team.id}
//             className="p-6 bg-white border border-gray-200 rounded-lg"
//           >
//             <div className="flex items-start justify-between">
//               <div>
//                 <h3 className="flex items-center text-xl font-semibold text-gray-900">
//                   <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
//                   {team.name}
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-600">
//                   <Users className="inline w-4 h-4 mr-1" />
//                   {team.athleteCount} athletes
//                 </p>
//               </div>
//             </div>

//             <div className="mt-4">
//               <h4 className="flex items-center mb-3 font-medium text-gray-900">
//                 <User className="w-4 h-4 mr-2" />
//                 Coaching Staff
//               </h4>
//               {team.members && team.members.length > 0 ? (
//                 <div className="space-y-2">
//                   {team.members
//                     .filter((member) => member.role === "pelatih")
//                     .map((coach) => (
//                       <div key={coach.id} className="flex items-center">
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                           <User className="w-4 h-4 text-blue-600" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="font-medium text-gray-900">
//                             {coach.name}
//                           </p>
//                           <p className="text-sm text-gray-600">{coach.email}</p>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">No coaches found</p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {teams.length === 0 && !loading && (
//         <div className="py-12 text-center text-gray-500">
//           <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//           <p>No teams found</p>
//         </div>
//       )}
//     </div>
//   );
// }
