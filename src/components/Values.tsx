import { Heart, Cross, Handshake, Church, Lightbulb, Music, Users, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const values = [
    {
        Icon: Heart,
        title: "Amour Fraternel",
        desc: "Nous nous aimons les uns les autres comme Christ nous a aimés, dans le respect et la bienveillance.",
        verse: "Jean 13:34 - 'Aimez-vous les uns les autres; comme je vous ai aimés'",
        color: "from-red-500 to-pink-500",
        fullDesc: "L'amour est le fondement de notre communauté. Nous nous soutenons dans les moments difficiles, célébrons ensemble les joies, et vivons une véritable fraternité chrétienne où chacun se sent accepté et valorisé. Cet amour se manifeste par des actions concrètes de soutien, d'écoute et de partage quotidien."
    },
    {
        Icon: Cross,
        title: "Foi en Dieu",
        desc: "Notre foi est le fondement de notre communauté, guidant nos chants et nos actions au service du Seigneur.",
        verse: "Psaumes 98:4 - 'Poussez vers l'Éternel des cris de joie, vous tous, habitants de la terre!'",
        color: "from-amber-500 to-orange-500",
        fullDesc: "Notre foi nous unit et nous guide dans toutes nos actions. Elle est la source de notre inspiration musicale et nous rappelle que chaque note chantée est une prière, chaque concert une célébration de la présence de Dieu dans nos vies."
    },
    {
        Icon: Handshake,
        title: "Amitié Chrétienne",
        desc: "Nous cultivons des liens d'amitié sincères, soudés par la parole de Dieu et le partage fraternel.",
        verse: "Proverbes 17:17 - 'L'ami aime en tout temps'",
        color: "from-emerald-500 to-teal-500",
        fullDesc: "Au-delà du chant, nous tissons des amitiés profondes et durables. Nous nous retrouvons régulièrement en dehors des répétitions pour partager des moments de convivialité, des repas, des prières et des activités qui renforcent nos liens fraternels."
    },
    {
        Icon: Church,
        title: "Communauté de Foi",
        desc: "Ensemble, nous formons une famille unie dans la prière, le chant et le service à Dieu et à notre prochain.",
        verse: "Hébreux 10:24-25 - 'N'abandonnons pas notre assemblée'",
        color: "from-purple-500 to-indigo-500",
        fullDesc: "Nous sommes plus qu'un simple chœur, nous sommes une véritable famille spirituelle. Chaque membre trouve sa place et contribue à l'édification de tous, dans un esprit d'humilité et de service mutuel."
    },
    {
        Icon: Music,
        title: "Louange Divine",
        desc: "Nos voix s'élèvent pour glorifier Dieu, partageant sa parole à travers l'harmonie et la beauté du chant choral.",
        verse: "Psaumes 150:6 - 'Que tout ce qui respire loue l'Éternel!'",
        color: "from-blue-500 to-cyan-500",
        fullDesc: "Notre mission première est de louer Dieu par le chant. Chaque répétition est une préparation à l'adoration, chaque concert une offrande musicale qui élève les cœurs vers le Seigneur et touche ceux qui nous écoutent."
    },
    {
        Icon: Lightbulb,
        title: "Espérance et Lumière",
        desc: "Nous portons la lumière du Christ à travers nos chants, apportant espoir et réconfort à ceux qui nous écoutent.",
        verse: "Matthieu 5:14 - 'Vous êtes la lumière du monde'",
        color: "from-yellow-500 to-amber-500",
        fullDesc: "Dans un monde parfois sombre, notre chœur est un phare d'espérance. Nos concerts apportent réconfort aux âmes éprouvées, joie aux cœurs tristes et lumière à ceux qui cherchent un sens à leur vie."
    },
    {
        Icon: Users,
        title: "Service et Partage",
        desc: "Nous servons notre prochain avec amour, partageant nos dons et nos talents pour la gloire de Dieu.",
        verse: "1 Pierre 4:10 - 'Mettez-vous au service les uns des autres'",
        color: "from-green-500 to-emerald-500",
        fullDesc: "Nous mettons nos talents au service de la communauté, que ce soit à travers des concerts caritatifs, des visites dans les maisons de retraite, ou des actions de soutien aux plus démunis. Servir notre prochain, c'est servir Dieu."
    },
    {
        Icon: Shield,
        title: "Protection Divine",
        desc: "Nous nous confions à la protection de Dieu qui guide nos pas et bénit notre cheminement spirituel.",
        verse: "Psaumes 121:7-8 - 'L'Éternel te gardera de tout mal'",
        color: "from-indigo-500 to-purple-500",
        fullDesc: "Nous plaçons notre chœur sous la protection de Dieu, confiants qu'Il guide nos pas, bénit nos projets et nous garde unis dans l'épreuve comme dans la joie. Sa protection est notre assurance et notre force."
    }
];

export default function Values() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
            {/* Décoration de fond avec croix */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="absolute top-10 left-10 w-32 h-32" viewBox="0 0 100 100">
                    <path d="M50 20 L50 80 M35 35 L65 65 M35 65 L65 35" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
                <svg className="absolute bottom-10 right-10 w-40 h-40" viewBox="0 0 100 100">
                    <path d="M50 10 L50 90 M20 35 L80 65 M20 65 L80 35" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M50 50 L70 70 M50 50 L30 70 M50 50 L70 30 M50 50 L30 30" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* En-tête avec verset biblique */}
                <div className="text-center mb-12 space-y-4">


                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-center">
                        Fondements de{" "}
                        <span className="relative inline-block">
                            notre communauté
                            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary/30 rounded-full" />
                        </span>
                    </h2>

                    <p className="text-md max-w-2xl mx-auto text-gray-600 italic">
                        "Je chanterai à mon Dieu tant que je vivrai" — Psaume 104:33
                    </p>
                </div>

                {/* Grille des valeurs - Cartes réduites */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                    {values.map(({ Icon, title, desc, verse, color, fullDesc }, i) => {
                        const isExpanded = expandedId === i;

                        return (
                            <div
                                key={i}
                                className={`group relative bg-white rounded-xl transition-all duration-500 cursor-pointer ${isExpanded ? 'col-span-1 lg:col-span-2 row-span-1' : ''
                                    }`}
                                style={{
                                    boxShadow: "0 4px 20px -10px rgba(0,0,0,0.1)",
                                    border: "1px solid rgba(0,0,0,0.05)"
                                }}
                                onClick={() => toggleExpand(i)}
                            >
                                {/* Contenu compact (réduit) */}
                                <div className="p-4">
                                    {/* Badge décoratif */}
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Cross className="w-3 h-3 text-white" />
                                    </div>

                                    {/* Icône avec dégradé - plus petite */}
                                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-r ${color} shadow-md group-hover:scale-105 transition-transform duration-300`}>
                                        <Icon className="w-6 h-6 text-white" />
                                        <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                    </div>

                                    {/* Titre - plus petit */}
                                    <h3 className="text-base font-bold text-center mb-2 text-gray-800">
                                        {title}
                                    </h3>

                                    {/* Description courte */}
                                    <p className="text-xs text-center text-gray-600 leading-relaxed line-clamp-2">
                                        {desc}
                                    </p>

                                    {/* Verset biblique - plus compact */}
                                    <div className="pt-2 mt-2 border-t border-amber-100">
                                        <div className="text-[10px] text-amber-600 italic text-center leading-relaxed line-clamp-1">
                                            <span className="font-semibold">📖 </span>
                                            {verse}
                                        </div>
                                    </div>

                                    {/* Indicateur d'expansion */}
                                    <div className="flex justify-center mt-2">
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400 animate-pulse" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                        )}
                                    </div>
                                </div>

                                {/* Contenu étendu (apparaît au clic) */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 border-t border-amber-100 animate-fade-in">
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {fullDesc}
                                            </p>

                                            {/* Verset complet */}
                                            <div className="bg-amber-50 rounded-lg p-3 mt-2">
                                                <div className="text-xs text-amber-800 italic text-center leading-relaxed">
                                                    <span className="font-semibold block text-center mb-1">📖 Verset clé</span>
                                                    {verse}
                                                </div>
                                            </div>

                                            {/* Action suggérée */}
                                            <div className="flex justify-center mt-2">
                                                <button
                                                    className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExpand(i);
                                                    }}
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                    Réduire
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Effet de lumière au survol */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Section de témoignage biblique - plus compacte */}


                {/* Appel à la prière - plus compact */}
                <div className="mt-12 flex justify-center">
                  
                </div>
            </div>

            <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #F59E0B 0%, #DC2626 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </section>
    );
}