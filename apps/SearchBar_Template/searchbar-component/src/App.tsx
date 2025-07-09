// // // // // // import { useState, useEffect } from "react";

// // // // // // export default function App() {
// // // // // //   const [query, setQuery] = useState("");
// // // // // //   const [status, setStatus] = useState("");
// // // // // //   const [loading, setLoading] = useState(false);
// // // // // //   const [progress, setProgress] = useState(0);

// // // // // //   const statusMessages = [
// // // // // //     "Got your query, please hold on",
// // // // // //     "Consulting domain experts",
// // // // // //     "Searching our knowledge base",
// // // // // //     "Synthesizing best results",
// // // // // //     "Answer ready!",
// // // // // //   ];

// // // // // //   useEffect(() => {
// // // // // //     let progressTimer: NodeJS.Timeout;

// // // // // //     if (loading) {
// // // // // //       setProgress(0);
// // // // // //       progressTimer = setInterval(() => {
// // // // // //         setProgress((old) => {
// // // // // //           if (old >= 100) return 100;
// // // // // //           return old + 5;
// // // // // //         });
// // // // // //       }, 200);
// // // // // //     }

// // // // // //     return () => clearInterval(progressTimer);
// // // // // //   }, [loading]);

// // // // // //   const handleSearch = () => {
// // // // // //     if (!query) return;

// // // // // //     setLoading(true);
// // // // // //     let i = 0;

// // // // // //     const sequence = setInterval(() => {
// // // // // //       if (i >= statusMessages.length) {
// // // // // //         clearInterval(sequence);
// // // // // //         setLoading(false);
// // // // // //         return;
// // // // // //       }
// // // // // //       setStatus(statusMessages[i]);
// // // // // //       i++;
// // // // // //     }, 1500);
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
// // // // // //       <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl flex flex-col gap-4">
// // // // // //         <input
// // // // // //           type="text"
// // // // // //           placeholder="Ask me anything..."
// // // // // //           className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
// // // // // //           value={query}
// // // // // //           onChange={(e) => setQuery(e.target.value)}
// // // // // //         />
// // // // // //         <button
// // // // // //           onClick={handleSearch}
// // // // // //           className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
// // // // // //         >
// // // // // //           Search
// // // // // //         </button>
// // // // // //         {loading && (
// // // // // //           <div className="flex flex-col gap-2 animate-fade-in text-gray-600">
// // // // // //             <div className="flex items-center gap-2">
// // // // // //               <span>{status}</span>
// // // // // //               <span className="dot-flash">...</span>
// // // // // //             </div>
// // // // // //             <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
// // // // // //               <div
// // // // // //                 className="h-2 bg-blue-500 transition-all"
// // // // // //                 style={{ width: `${progress}%` }}
// // // // // //               />
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }





// // // // // // // import { useState } from "react";

// // // // // // // export default function App() {
// // // // // // //   const [query, setQuery] = useState("");
// // // // // // //   const [status, setStatus] = useState("");
// // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // //   const handleSearch = () => {
// // // // // // //     if (!query) return;
// // // // // // //     setLoading(true);
// // // // // // //     setStatus("Got your query, please hold on...");

// // // // // // //     setTimeout(() => {
// // // // // // //       setStatus("Consulting domain experts...");
// // // // // // //     }, 1000);

// // // // // // //     setTimeout(() => {
// // // // // // //       setStatus("Searching our knowledge base...");
// // // // // // //     }, 2000);

// // // // // // //     setTimeout(() => {
// // // // // // //       setStatus("Synthesizing best results for you...");
// // // // // // //     }, 3000);

// // // // // // //     setTimeout(() => {
// // // // // // //       setStatus("Answer ready!");
// // // // // // //       setLoading(false);
// // // // // // //     }, 4000);
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
// // // // // // //       <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl flex flex-col gap-4">
// // // // // // //         <input
// // // // // // //           type="text"
// // // // // // //           placeholder="Ask me anything..."
// // // // // // //           className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
// // // // // // //           value={query}
// // // // // // //           onChange={(e) => setQuery(e.target.value)}
// // // // // // //         />
// // // // // // //         <button
// // // // // // //           onClick={handleSearch}
// // // // // // //           className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
// // // // // // //         >
// // // // // // //           Search
// // // // // // //         </button>
// // // // // // //         {loading && (
// // // // // // //           <div className="text-gray-600 animate-pulse">{status}</div>
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }



// // // // // // // // import { SearchBar } from './components/SearchBar';

// // // // // // // // function App() {
// // // // // // // //   const fakeSearch = async (query: string) => {
// // // // // // // //     // simulate searching delay
// // // // // // // //     return new Promise<string>((resolve) => {
// // // // // // // //       setTimeout(() => {
// // // // // // // //         resolve(`Result for: ${query}`);
// // // // // // // //       }, 4000); // simulate 4s delay
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
// // // // // // // //       <SearchBar onSearch={fakeSearch} />
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // export default App;



// // // // // import { useState, useEffect } from "react";

// // // // // export default function App() {
// // // // //   const [query, setQuery] = useState("");
// // // // //   const [status, setStatus] = useState("");
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [progress, setProgress] = useState(0);

// // // // //   const statusMessages = [
// // // // //     "🤖 Got your query...",
// // // // //     "🧩 Sending to domain experts...",
// // // // //     "🌐 Searching online sources...",
// // // // //     "🔍 Searching databases...",
// // // // //     "✅ Finalizing answer..."
// // // // //   ];

// // // // //   useEffect(() => {
// // // // //     let progressTimer: NodeJS.Timeout;

// // // // //     if (loading) {
// // // // //       setProgress(0);
// // // // //       progressTimer = setInterval(() => {
// // // // //         setProgress((old) => {
// // // // //           if (old >= 100) return 100;
// // // // //           return old + 4;
// // // // //         });
// // // // //       }, 150);
// // // // //     }

// // // // //     return () => clearInterval(progressTimer);
// // // // //   }, [loading]);

// // // // //   const handleSearch = () => {
// // // // //     if (!query) return;
// // // // //     setLoading(true);
// // // // //     let i = 0;

// // // // //     const sequence = setInterval(() => {
// // // // //       if (i >= statusMessages.length) {
// // // // //         clearInterval(sequence);
// // // // //         setLoading(false);
// // // // //         return;
// // // // //       }
// // // // //       setStatus(statusMessages[i]);
// // // // //       i++;
// // // // //     }, 1800);
// // // // //   };

// // // // //   return (
// // // // //     <div className="flex items-center justify-center h-screen bg-background text-white font-sans">
// // // // //       <div className="bg-surface rounded-3xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 backdrop-blur-md border border-gray-700">
// // // // //         <input
// // // // //           type="text"
// // // // //           placeholder="Ask your smart assistant..."
// // // // //           className="w-full rounded-xl px-6 py-4 text-lg bg-background border border-gray-600 shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
// // // // //           value={query}
// // // // //           onChange={(e) => setQuery(e.target.value)}
// // // // //         />
// // // // //         <button
// // // // //           onClick={handleSearch}
// // // // //           className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white font-semibold tracking-wide shadow-lg hover:shadow-accent2/50 transition-all duration-300"
// // // // //         >
// // // // //           🚀 Search Now
// // // // //         </button>
// // // // //         {loading && (
// // // // //           <div className="flex flex-col gap-3 items-center animate-fade-in text-accent">
// // // // //             <div className="flex items-center gap-2 text-xl tracking-wide">
// // // // //               <span className="">{status}</span>
// // // // //               <span className="dot-flash"></span>
// // // // //             </div>
// // // // //             <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
// // // // //               <div
// // // // //                 className="h-2 bg-gradient-to-r from-accent to-accent2 transition-all"
// // // // //                 style={{ width: `${progress}%` }}
// // // // //               ></div>
// // // // //             </div>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }


// // // // import { useState, useEffect } from "react";

// // // // export default function App() {
// // // //   const [query, setQuery] = useState("");
// // // //   const [status, setStatus] = useState("");
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [progress, setProgress] = useState(0);

// // // //   const statusMessages = [
// // // //     "Received your query, please wait",
// // // //     "Consulting domain experts",
// // // //     "Searching our knowledge base",
// // // //     "Fetching online sources",
// // // //     "Finalizing your answer"
// // // //   ];

// // // //   useEffect(() => {
// // // //     let progressTimer: NodeJS.Timeout;

// // // //     if (loading) {
// // // //       setProgress(0);
// // // //       progressTimer = setInterval(() => {
// // // //         setProgress((old) => {
// // // //           if (old >= 100) return 100;
// // // //           return old + 4;
// // // //         });
// // // //       }, 150);
// // // //     }

// // // //     return () => clearInterval(progressTimer);
// // // //   }, [loading]);

// // // //   const handleSearch = () => {
// // // //     if (!query) return;
// // // //     setLoading(true);
// // // //     let i = 0;

// // // //     const sequence = setInterval(() => {
// // // //       if (i >= statusMessages.length) {
// // // //         clearInterval(sequence);
// // // //         setLoading(false);
// // // //         return;
// // // //       }
// // // //       setStatus(statusMessages[i]);
// // // //       i++;
// // // //     }, 1800);
// // // //   };

// // // //   return (
// // // //     <div className="flex items-center justify-center h-screen bg-background text-white font-sans">
// // // //       <div className="bg-surface rounded-3xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 backdrop-blur-md border border-gray-700">
// // // //         <input
// // // //           type="text"
// // // //           placeholder="Ask your smart assistant..."
// // // //           className="w-full rounded-xl px-6 py-4 text-lg bg-background border border-gray-600 shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
// // // //           value={query}
// // // //           onChange={(e) => setQuery(e.target.value)}
// // // //         />
// // // //         <button
// // // //           onClick={handleSearch}
// // // //           className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white font-semibold tracking-wide shadow-lg hover:shadow-accent2/50 transition-all duration-300"
// // // //         >
// // // //           Search
// // // //         </button>
// // // //         {loading && (
// // // //           <div className="flex flex-col gap-4 items-center animate-fade-in text-accent">
// // // //             <div className="flex items-center gap-3 text-xl tracking-wide">
// // // //               <div className="loader ease-linear rounded-full border-4 border-t-accent border-gray-300 h-12 w-12 animate-spin"></div>

// // // //               <span>{status}</span>
// // // //             </div>
// // // //             <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
// // // //               <div
// // // //                 className="h-2 bg-gradient-to-r from-accent to-accent2 transition-all"
// // // //                 style={{ width: `${progress}%` }}
// // // //               ></div>
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // import { useState, useEffect } from "react";

// // // export default function App() {
// // //   const [query, setQuery] = useState("");
// // //   const [status, setStatus] = useState("");
// // //   const [loading, setLoading] = useState(false);
// // //   const [progress, setProgress] = useState(0);

// // //   const statusMessages = [
// // //     "Received your query, please wait",
// // //     "Consulting domain experts",
// // //     "Searching our knowledge base",
// // //     "Fetching online sources",
// // //     "Finalizing your answer"
// // //   ];

// // //   useEffect(() => {
// // //     let progressTimer: NodeJS.Timeout;

// // //     if (loading) {
// // //       setProgress(0);
// // //       progressTimer = setInterval(() => {
// // //         setProgress((old) => {
// // //           if (old >= 100) return 100;
// // //           return old + 4;
// // //         });
// // //       }, 150);
// // //     }

// // //     return () => clearInterval(progressTimer);
// // //   }, [loading]);

// // //   const handleSearch = () => {
// // //     if (!query) return;
// // //     setLoading(true);
// // //     let i = 0;

// // //     const sequence = setInterval(() => {
// // //       if (i >= statusMessages.length) {
// // //         clearInterval(sequence);
// // //         setLoading(false);
// // //         return;
// // //       }
// // //       setStatus(statusMessages[i]);
// // //       i++;
// // //     }, 1800);
// // //   };

// // //   return (
// // //     <div className="flex items-center justify-center h-screen bg-background text-white font-sans">
// // //       <div className="bg-surface rounded-3xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 backdrop-blur-md border border-gray-700">
// // //         <input
// // //           type="text"
// // //           placeholder="Ask your smart assistant..."
// // //           className="w-full rounded-xl px-6 py-4 text-lg bg-background border border-gray-600 shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition"
// // //           value={query}
// // //           onChange={(e) => setQuery(e.target.value)}
// // //         />
// // //         <button
// // //           onClick={handleSearch}
// // //           className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white font-semibold tracking-wide shadow-lg hover:shadow-accent2/50 transition-all duration-300"
// // //         >
// // //           Search
// // //         </button>
// // //         {loading && (
// // //           <div className="flex flex-col gap-4 items-center animate-fade-in text-accent">
// // //             <div className="flex items-center gap-4 text-xl tracking-wide">
// // //               {/* dotted spinner */}
// // //               <div className="dotted-spinner">
// // //                 {Array.from({ length: 8 }).map((_, i) => (
// // //                   <div key={i}></div>
// // //                 ))}
// // //               </div>
// // //               <span>{status}</span>
// // //             </div>
// // //             <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
// // //               <div
// // //                 className="h-2 bg-gradient-to-r from-accent to-accent2 transition-all"
// // //                 style={{ width: `${progress}%` }}
// // //               ></div>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }



// // import { useState, useEffect } from "react";

// // export default function App() {
// //   const [query, setQuery] = useState("");
// //   const [status, setStatus] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [progress, setProgress] = useState(0);

// //   const statusMessages = [
// //     "Received your query, please wait",
// //     "Consulting domain experts",
// //     "Searching our knowledge base",
// //     "Fetching online sources",
// //     "Finalizing your answer"
// //   ];

// //   useEffect(() => {
// //     let progressTimer: NodeJS.Timeout;

// //     if (loading) {
// //       setProgress(0);
// //       progressTimer = setInterval(() => {
// //         setProgress((old) => (old >= 100 ? 100 : old + 4));
// //       }, 150);
// //     }

// //     return () => clearInterval(progressTimer);
// //   }, [loading]);

// //   const handleSearch = () => {
// //     if (!query) return;
// //     setLoading(true);
// //     let i = 0;

// //     const sequence = setInterval(() => {
// //       if (i >= statusMessages.length) {
// //         clearInterval(sequence);
// //         setLoading(false);
// //         return;
// //       }
// //       setStatus(statusMessages[i]);
// //       i++;
// //     }, 1800);
// //   };

// //   return (
// //     <div className="flex items-center justify-center h-screen bg-background font-inter text-white">
// //       <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center gap-6">
// //         <input
// //           type="text"
// //           placeholder="Ask your smart assistant..."
// //           className="w-full rounded-xl px-6 py-4 text-lg bg-white/10 border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition shadow-inner backdrop-blur"
// //           value={query}
// //           onChange={(e) => setQuery(e.target.value)}
// //         />
// //         <button
// //           onClick={handleSearch}
// //           className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent2 text-white font-semibold tracking-wide shadow-lg hover:scale-105 hover:shadow-accent2/50 transition-all duration-300"
// //         >
// //           Search
// //         </button>
// //         {loading && (
// //           <div className="flex flex-col gap-4 items-center animate-fade-in text-accent">
// //             <div className="flex items-center gap-4 text-xl tracking-wide">
// //               <div className="dotted-spinner">
// //                 {Array.from({ length: 8 }).map((_, i) => (
// //                   <div key={i}></div>
// //                 ))}
// //               </div>
// //               <span>{status}</span>
// //             </div>
// //             <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
// //               <div
// //                 className="h-2 bg-gradient-to-r from-accent to-accent2 transition-all"
// //                 style={{ width: `${progress}%` }}
// //               ></div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }


// import { useState, useEffect } from "react";

// export default function App() {
//   const [query, setQuery] = useState("");
//   const [status, setStatus] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const statusMessages = [
//     "Received your query, please wait",
//     "Consulting domain experts",
//     "Searching our knowledge base",
//     "Fetching online sources",
//     "Finalizing your answer"
//   ];

//   useEffect(() => {
//     let progressTimer: ReturnType<typeof setInterval>;

//     if (loading) {
//       setProgress(0);
//       progressTimer = setInterval(() => {
//         setProgress((old) => (old >= 100 ? 100 : old + 4));
//       }, 150);
//     }

//     return () => clearInterval(progressTimer);
//   }, [loading]);

//   const handleSearch = () => {
//     if (!query) return;
//     setLoading(true);
//     let i = 0;

//     const sequence = setInterval(() => {
//       if (i >= statusMessages.length) {
//         clearInterval(sequence);
//         setLoading(false);
//         return;
//       }
//       setStatus(statusMessages[i]);
//       i++;
//     }, 1800);
//   };

//   return (
//     <div className="flex items-center justify-center h-screen bg-background font-inter text-white">
//       <div className="backdrop-blur-lg bg-surface/70 border border-surface/40 rounded-3xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center gap-6">
//         <div className="flex w-full gap-4">
//           <input
//             type="text"
//             placeholder="Ask your smart assistant..."
//             className="flex-grow rounded-xl px-6 py-4 text-lg bg-surface border border-surface/40 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition shadow-inner backdrop-blur"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//           <button
//             onClick={handleSearch}
//             className="px-8 py-3 rounded-xl bg-accent text-white font-semibold tracking-wide shadow-lg hover:scale-105 hover:shadow-accent/50 transition-all duration-300"
//           >
//             Search
//           </button>
//         </div>

//         {loading && (
//           <div className="flex flex-col items-center gap-4 animate-fade-in text-accent">
//             <div className="flex items-center gap-4 text-xl tracking-wide">
//               <div className="h-6 w-6 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
//               <span>{status}</span>
//             </div>
//             <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
//               <div
//                 className="h-2 bg-accent transition-all"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const statusMessages = [
    "Received your query, please wait",
    "Consulting domain experts",
    "Searching our knowledge base",
    "Fetching online sources",
    "Finalizing your answer"
  ];

  useEffect(() => {
    let progressTimer: ReturnType<typeof setInterval>;

    if (loading) {
      setProgress(0);
      progressTimer = setInterval(() => {
        setProgress((old) => (old >= 100 ? 100 : old + 4));
      }, 150);
    }

    return () => clearInterval(progressTimer);
  }, [loading]);

  const handleSearch = () => {
    if (!query) return;
    setLoading(true);
    setStatus("");
    let i = 0;

    const sequence = setInterval(() => {
      if (i >= statusMessages.length) {
        clearInterval(sequence);
        setLoading(false);
        return;
      }
      typeWriter(statusMessages[i], setStatus);
      i++;
    }, 2000);
  };

  const typeWriter = (text: string, setter: (value: string) => void) => {
    let index = 0;
    const speed = 50; // typing speed
    const typeInterval = setInterval(() => {
      setter(text.slice(0, index + 1));
      index++;
      if (index === text.length) {
        clearInterval(typeInterval);
      }
    }, speed);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background font-inter text-white">
      <div className="backdrop-blur-lg bg-surface/70 border border-surface/40 rounded-3xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center gap-6">
        <div className="flex w-full gap-4 justify-center">
          <input
            type="text"
            placeholder="Ask your smart assistant..."
            className="flex-grow rounded-xl px-6 py-4 text-lg bg-surface border border-surface/40 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition shadow-inner backdrop-blur"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="px-8 py-3 rounded-xl bg-accent text-white font-semibold tracking-wide shadow-lg hover:scale-105 hover:shadow-accent/50 transition-all duration-300"
          >
            Search
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 animate-fade-in text-accent text-center">
            <div className="flex items-center gap-4 text-xl tracking-wide">
              <div className="h-6 w-6 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
              <span>{status}</span>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-2 bg-accent transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
