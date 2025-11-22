<?php

namespace Database\Seeders;

use App\Models\AnswerOption;
use App\Models\Level;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuizQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        // Get themes and levels
        $themes = Theme::orderBy('created_at', 'asc')->get();
        $levels = Level::orderBy('order')->get();

        if ($themes->isEmpty() || $levels->isEmpty()) {
            $this->command->error('Please run LevelsSeeder and ThemesSeeder first!');
            return;
        }

        $questionsData = [
            // Thème 1: Déchets et Recyclage
            'Déchets et Recyclage' => [
                // Niveau 1 - Découverte
                1 => [
                    [
                        'text' => 'Quelle est la première étape du tri des déchets ?',
                        'explanation' => 'Avant toute chose, il faut séparer les matériaux recyclables comme le papier, le plastique, le verre et le métal. Comme ça, on évite qu\'ils se mélangent avec les déchets organiques ou non recyclables, ce qui facilite le tri ultérieur.',
                        'options' => [
                            ['text' => 'Jeter tous les déchets dans une seule poubelle', 'is_correct' => false],
                            ['text' => 'Séparer les matières recyclables', 'is_correct' => true],
                            ['text' => 'Brûler les déchets organiques', 'is_correct' => false],
                            ['text' => 'Les envoyer à Elon Musk pour qu\'il les envoie sur Mars', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Combien de temps met une bouteille en plastique à se décomposer dans la nature ?',
                        'explanation' => 'Une bouteille en plastique met entre 100 et 1000 ans à se décomposer dans la nature ! C\'est pourquoi il est super important de les recycler.',
                        'options' => [
                            ['text' => '1 an', 'is_correct' => false],
                            ['text' => '10 ans', 'is_correct' => false],
                            ['text' => '100 à 1000 ans', 'is_correct' => true],
                            ['text' => '1 mois', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Que peut-on mettre dans un composteur ?',
                        'explanation' => 'Les épluchures de fruits et légumes, le marc de café, les coquilles d\'œufs, le pain dur... Bref, tout ce qui est organique et qui va se décomposer naturellement pour faire du super compost !',
                        'options' => [
                            ['text' => 'Les épluchures de légumes', 'is_correct' => true],
                            ['text' => 'Les sacs en plastique', 'is_correct' => false],
                            ['text' => 'Les canettes en aluminium', 'is_correct' => false],
                            ['text' => 'Les vieux téléphones', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 2 - Connaisseur
                2 => [
                    [
                        'text' => 'Quel symbole indique qu\'un produit est recyclable ?',
                        'explanation' => 'Le cercle de Möbius (trois flèches en triangle) indique qu\'un produit est recyclable ou qu\'il contient des matériaux recyclés. Attention, ça ne veut pas dire qu\'il sera forcément recyclé dans ta commune !',
                        'options' => [
                            ['text' => 'Le trident', 'is_correct' => false],
                            ['text' => 'Le cercle de Möbius (trois flèches en triangle)', 'is_correct' => true],
                            ['text' => 'Une poubelle barrée', 'is_correct' => false],
                            ['text' => 'Un arbre', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel pourcentage des déchets ménagers peut être recyclé ou composté ?',
                        'explanation' => 'Environ 60% de nos déchets peuvent être recyclés ou compostés ! Malheureusement, on est encore loin d\'y arriver en pratique. D\'où l\'importance du tri.',
                        'options' => [
                            ['text' => '20%', 'is_correct' => false],
                            ['text' => '40%', 'is_correct' => false],
                            ['text' => '60%', 'is_correct' => true],
                            ['text' => '80%', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Les emballages en carton souillés par la nourriture peuvent-ils être recyclés ?',
                        'explanation' => 'Non, les cartons trop sales ne peuvent pas être recyclés car la graisse et les restes alimentaires contaminent le processus de recyclage. Mieux vaut les mettre au compost si possible !',
                        'options' => [
                            ['text' => 'Oui, toujours', 'is_correct' => false],
                            ['text' => 'Non, ils doivent être jetés avec les ordures ménagères', 'is_correct' => true],
                            ['text' => 'Oui, mais seulement s\'ils sont lavés', 'is_correct' => false],
                            ['text' => 'Ça dépend de la couleur du carton', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que l\'upcycling ?',
                        'explanation' => 'L\'upcycling, c\'est transformer des déchets ou des objets inutilisés en nouveaux produits de meilleure qualité. Par exemple, faire une lampe avec une vieille bouteille !',
                        'options' => [
                            ['text' => 'Jeter ses déchets dans une décharge', 'is_correct' => false],
                            ['text' => 'Transformer des déchets en objets de meilleure qualité', 'is_correct' => true],
                            ['text' => 'Brûler ses déchets pour produire de l\'énergie', 'is_correct' => false],
                            ['text' => 'Compacter les déchets', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 3 - Expert
                3 => [
                    [
                        'text' => 'Quelle est la différence entre recyclage et valorisation énergétique ?',
                        'explanation' => 'Le recyclage transforme les déchets en nouvelles matières premières, tandis que la valorisation énergétique consiste à brûler les déchets pour produire de l\'énergie (chaleur ou électricité).',
                        'options' => [
                            ['text' => 'Il n\'y a pas de différence', 'is_correct' => false],
                            ['text' => 'Le recyclage transforme en matières premières, la valorisation produit de l\'énergie', 'is_correct' => true],
                            ['text' => 'La valorisation est meilleure pour l\'environnement', 'is_correct' => false],
                            ['text' => 'Le recyclage coûte plus cher', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel est le principe de l\'économie circulaire ?',
                        'explanation' => 'L\'économie circulaire vise à réduire le gaspillage en réutilisant, réparant et recyclant les produits le plus longtemps possible, contrairement au modèle linéaire "extraire-fabriquer-jeter".',
                        'options' => [
                            ['text' => 'Produire toujours plus', 'is_correct' => false],
                            ['text' => 'Réduire, réutiliser et recycler pour limiter les déchets', 'is_correct' => true],
                            ['text' => 'Exporter ses déchets à l\'étranger', 'is_correct' => false],
                            ['text' => 'Enterrer tous les déchets', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Les métaux rares des appareils électroniques sont-ils recyclables ?',
                        'explanation' => 'Oui, mais c\'est compliqué ! Les métaux rares (or, argent, palladium...) peuvent être recyclés, mais ça nécessite des processus spécialisés. D\'où l\'importance de rapporter ses vieux appareils en déchetterie.',
                        'options' => [
                            ['text' => 'Non, jamais', 'is_correct' => false],
                            ['text' => 'Oui, mais avec des processus complexes', 'is_correct' => true],
                            ['text' => 'Seulement les métaux précieux', 'is_correct' => false],
                            ['text' => 'Uniquement dans certains pays', 'is_correct' => false],
                        ]
                    ],
                ],
            ],

            // Thème 2: Énergie
            'Énergie' => [
                // Niveau 1
                1 => [
                    [
                        'text' => 'Quelle source d\'énergie est renouvelable ?',
                        'explanation' => 'Le soleil est une source d\'énergie renouvelable car elle ne s\'épuise pas à notre échelle de temps. On peut capter son énergie avec des panneaux solaires !',
                        'options' => [
                            ['text' => 'Le charbon', 'is_correct' => false],
                            ['text' => 'Le pétrole', 'is_correct' => false],
                            ['text' => 'Le soleil', 'is_correct' => true],
                            ['text' => 'Le gaz naturel', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quelle ampoule consomme le moins d\'énergie ?',
                        'explanation' => 'Les ampoules LED consomment jusqu\'à 90% d\'énergie en moins que les ampoules à incandescence et durent beaucoup plus longtemps !',
                        'options' => [
                            ['text' => 'Ampoule à incandescence', 'is_correct' => false],
                            ['text' => 'Ampoule halogène', 'is_correct' => false],
                            ['text' => 'Ampoule LED', 'is_correct' => true],
                            ['text' => 'Toutes consomment pareil', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Faut-il éteindre les lumières quand on quitte une pièce ?',
                        'explanation' => 'Oui ! Même pour quelques minutes, ça vaut le coup. Éteindre les lumières permet d\'économiser de l\'énergie et de réduire sa facture d\'électricité.',
                        'options' => [
                            ['text' => 'Oui, toujours', 'is_correct' => true],
                            ['text' => 'Non, ça use les ampoules', 'is_correct' => false],
                            ['text' => 'Seulement si on part plus d\'une heure', 'is_correct' => false],
                            ['text' => 'Peu importe', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 2
                2 => [
                    [
                        'text' => 'Quelle est la température idéale pour chauffer son logement en hiver ?',
                        'explanation' => '19°C dans les pièces à vivre, c\'est le bon compromis entre confort et économies d\'énergie. Chaque degré en moins, c\'est 7% d\'économies sur la facture !',
                        'options' => [
                            ['text' => '25°C', 'is_correct' => false],
                            ['text' => '22°C', 'is_correct' => false],
                            ['text' => '19°C', 'is_correct' => true],
                            ['text' => '15°C', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Les appareils en veille consomment-ils de l\'électricité ?',
                        'explanation' => 'Oui ! La consommation des appareils en veille peut représenter jusqu\'à 10% de la facture d\'électricité. Pense à utiliser des multiprises avec interrupteur !',
                        'options' => [
                            ['text' => 'Non, pas du tout', 'is_correct' => false],
                            ['text' => 'Oui, jusqu\'à 10% de la facture', 'is_correct' => true],
                            ['text' => 'Seulement les vieux appareils', 'is_correct' => false],
                            ['text' => 'Uniquement la nuit', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel appareil consomme le plus d\'énergie dans une maison ?',
                        'explanation' => 'Le chauffage représente environ 60% de la consommation énergétique d\'un logement ! D\'où l\'importance d\'une bonne isolation et d\'une température raisonnable.',
                        'options' => [
                            ['text' => 'La télévision', 'is_correct' => false],
                            ['text' => 'Le réfrigérateur', 'is_correct' => false],
                            ['text' => 'Le chauffage', 'is_correct' => true],
                            ['text' => 'L\'ordinateur', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'L\'énergie éolienne produit-elle du CO2 ?',
                        'explanation' => 'Non ! Une fois installée, une éolienne ne produit pas de CO2. Seule sa fabrication et son installation génèrent des émissions, mais elles sont largement compensées par l\'énergie propre produite.',
                        'options' => [
                            ['text' => 'Oui, beaucoup', 'is_correct' => false],
                            ['text' => 'Non, c\'est une énergie propre', 'is_correct' => true],
                            ['text' => 'Seulement quand il y a du vent', 'is_correct' => false],
                            ['text' => 'Autant que le charbon', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 3
                3 => [
                    [
                        'text' => 'Qu\'est-ce que le coefficient de performance (COP) d\'une pompe à chaleur ?',
                        'explanation' => 'Le COP mesure l\'efficacité d\'une pompe à chaleur : c\'est le rapport entre l\'énergie produite et l\'énergie consommée. Un COP de 3 signifie que pour 1 kWh consommé, on produit 3 kWh de chaleur !',
                        'options' => [
                            ['text' => 'Sa consommation électrique', 'is_correct' => false],
                            ['text' => 'Le rapport entre énergie produite et consommée', 'is_correct' => true],
                            ['text' => 'Son prix d\'achat', 'is_correct' => false],
                            ['text' => 'Sa durée de vie', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que le mix énergétique ?',
                        'explanation' => 'Le mix énergétique, c\'est la répartition des différentes sources d\'énergie (nucléaire, renouvelables, fossiles) utilisées pour produire l\'électricité d\'un pays. En France, le nucléaire domine largement.',
                        'options' => [
                            ['text' => 'Un cocktail énergétique', 'is_correct' => false],
                            ['text' => 'La répartition des sources d\'énergie d\'un pays', 'is_correct' => true],
                            ['text' => 'Le mélange de carburants', 'is_correct' => false],
                            ['text' => 'La consommation totale d\'énergie', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quelle est la principale limite des énergies renouvelables comme le solaire et l\'éolien ?',
                        'explanation' => 'Le principal défi, c\'est l\'intermittence : le soleil ne brille pas toujours et le vent ne souffle pas en continu. D\'où l\'importance du stockage de l\'énergie (batteries, barrages hydroélectriques...).',
                        'options' => [
                            ['text' => 'Elles coûtent trop cher', 'is_correct' => false],
                            ['text' => 'Leur production est intermittente', 'is_correct' => true],
                            ['text' => 'Elles polluent trop', 'is_correct' => false],
                            ['text' => 'Elles n\'existent pas vraiment', 'is_correct' => false],
                        ]
                    ],
                ],
            ],

            // Thème 3: Biodiversité
            'Biodiversité' => [
                // Niveau 1
                1 => [
                    [
                        'text' => 'Pourquoi les abeilles sont-elles importantes pour l\'environnement ?',
                        'explanation' => 'Les abeilles et autres insectes pollinisateurs sont essentiels car ils permettent la reproduction de 80% des espèces végétales ! Sans elles, bye bye les fruits et légumes.',
                        'options' => [
                            ['text' => 'Elles produisent du miel', 'is_correct' => false],
                            ['text' => 'Elles pollinisent les plantes', 'is_correct' => true],
                            ['text' => 'Elles nettoient l\'air', 'is_correct' => false],
                            ['text' => 'Elles chassent les moustiques', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Comment peut-on favoriser la biodiversité dans son jardin ?',
                        'explanation' => 'Planter des fleurs locales et variées attire les insectes pollinisateurs, les oiseaux et autres petits animaux. Plus ton jardin est diversifié, plus il est vivant !',
                        'options' => [
                            ['text' => 'Tondre très court', 'is_correct' => false],
                            ['text' => 'Utiliser beaucoup de pesticides', 'is_correct' => false],
                            ['text' => 'Planter des fleurs locales variées', 'is_correct' => true],
                            ['text' => 'Bétonner', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce qu\'une espèce invasive ?',
                        'explanation' => 'Une espèce invasive, c\'est une espèce introduite (souvent par l\'homme) qui se développe rapidement et menace les espèces locales. Par exemple, la grenouille taureau ou le frelon asiatique.',
                        'options' => [
                            ['text' => 'Une espèce très commune', 'is_correct' => false],
                            ['text' => 'Une espèce qui menace les espèces locales', 'is_correct' => true],
                            ['text' => 'Une espèce protégée', 'is_correct' => false],
                            ['text' => 'Une espèce disparue', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 2
                2 => [
                    [
                        'text' => 'Combien d\'espèces sont menacées d\'extinction dans le monde ?',
                        'explanation' => 'Plus d\'1 million d\'espèces sont menacées d\'extinction ! C\'est énorme et ça s\'accélère à cause de la destruction des habitats, du changement climatique et de la pollution.',
                        'options' => [
                            ['text' => '10 000', 'is_correct' => false],
                            ['text' => '100 000', 'is_correct' => false],
                            ['text' => 'Plus d\'1 million', 'is_correct' => true],
                            ['text' => '500', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce qu\'un corridor écologique ?',
                        'explanation' => 'Un corridor écologique, c\'est un passage naturel (haie, cours d\'eau, bande de végétation) qui permet aux animaux de se déplacer entre différents habitats sans danger.',
                        'options' => [
                            ['text' => 'Un zoo', 'is_correct' => false],
                            ['text' => 'Un passage pour les animaux entre habitats', 'is_correct' => true],
                            ['text' => 'Une route forestière', 'is_correct' => false],
                            ['text' => 'Un tunnel autoroutier', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Les pesticides affectent-ils uniquement les insectes nuisibles ?',
                        'explanation' => 'Non ! Les pesticides tuent aussi les insectes utiles comme les abeilles, les coccinelles et les papillons. Ils contaminent aussi l\'eau, les sols et toute la chaîne alimentaire.',
                        'options' => [
                            ['text' => 'Oui, uniquement les nuisibles', 'is_correct' => false],
                            ['text' => 'Non, ils affectent tous les insectes et la chaîne alimentaire', 'is_correct' => true],
                            ['text' => 'Seulement en cas de surdosage', 'is_correct' => false],
                            ['text' => 'Ils n\'affectent que les plantes', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Pourquoi faut-il préserver les zones humides ?',
                        'explanation' => 'Les zones humides (marais, tourbières) sont des réservoirs de biodiversité incroyables ! Elles filtrent l\'eau, protègent contre les inondations et stockent du carbone.',
                        'options' => [
                            ['text' => 'Pour faire du tourisme', 'is_correct' => false],
                            ['text' => 'Elles abritent une grande biodiversité et régulent l\'eau', 'is_correct' => true],
                            ['text' => 'Pour l\'agriculture intensive', 'is_correct' => false],
                            ['text' => 'Elles n\'ont aucune utilité', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 3
                3 => [
                    [
                        'text' => 'Qu\'est-ce que la sixième extinction de masse ?',
                        'explanation' => 'On parle de sixième extinction car les espèces disparaissent à un rythme 100 à 1000 fois plus rapide que naturellement, principalement à cause des activités humaines. Les précédentes extinctions étaient dues à des catastrophes naturelles.',
                        'options' => [
                            ['text' => 'L\'extinction des dinosaures', 'is_correct' => false],
                            ['text' => 'La disparition actuelle et rapide des espèces due à l\'homme', 'is_correct' => true],
                            ['text' => 'Une théorie scientifique', 'is_correct' => false],
                            ['text' => 'Un événement futur', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que la trame verte et bleue ?',
                        'explanation' => 'C\'est un outil d\'aménagement du territoire qui identifie et protège les continuités écologiques : la trame verte (milieux terrestres) et la trame bleue (milieux aquatiques).',
                        'options' => [
                            ['text' => 'Un réseau de parcs et jardins', 'is_correct' => false],
                            ['text' => 'Un réseau de continuités écologiques terrestres et aquatiques', 'is_correct' => true],
                            ['text' => 'Un code couleur pour les poubelles', 'is_correct' => false],
                            ['text' => 'Un plan d\'urbanisation', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel est l\'impact de l\'artificialisation des sols sur la biodiversité ?',
                        'explanation' => 'L\'artificialisation (bétonner, goudronner) détruit les habitats naturels, empêche l\'infiltration de l\'eau, fragmente les écosystèmes et contribue au réchauffement climatique. C\'est une catastrophe pour la biodiversité !',
                        'options' => [
                            ['text' => 'Aucun impact', 'is_correct' => false],
                            ['text' => 'Destruction des habitats et fragmentation des écosystèmes', 'is_correct' => true],
                            ['text' => 'Amélioration de la biodiversité', 'is_correct' => false],
                            ['text' => 'Impact uniquement sur les insectes', 'is_correct' => false],
                        ]
                    ],
                ],
            ],

            // Thème 4: Consommation responsable
            'Consommation responsable' => [
                // Niveau 1
                1 => [
                    [
                        'text' => 'Que signifie "consommer local" ?',
                        'explanation' => 'Consommer local, c\'est acheter des produits qui viennent de ta région ! Ça réduit les transports (donc les émissions de CO2), soutient les producteurs locaux et garantit des produits plus frais.',
                        'options' => [
                            ['text' => 'Acheter dans son pays', 'is_correct' => false],
                            ['text' => 'Acheter des produits de sa région', 'is_correct' => true],
                            ['text' => 'Acheter en ligne', 'is_correct' => false],
                            ['text' => 'Acheter en grande surface', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Pourquoi privilégier les produits de saison ?',
                        'explanation' => 'Les produits de saison sont cultivés naturellement, sans serres chauffées ni transport depuis l\'autre bout du monde. Résultat : moins d\'énergie dépensée, meilleur goût et meilleur pour ta santé !',
                        'options' => [
                            ['text' => 'Ils sont moins chers', 'is_correct' => false],
                            ['text' => 'Ils nécessitent moins d\'énergie et de transport', 'is_correct' => true],
                            ['text' => 'Ils sont plus beaux', 'is_correct' => false],
                            ['text' => 'Il n\'y a aucune raison', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que le commerce équitable ?',
                        'explanation' => 'Le commerce équitable garantit aux producteurs (souvent dans les pays en développement) un prix juste pour leur travail, ainsi que de meilleures conditions de travail et le respect de l\'environnement.',
                        'options' => [
                            ['text' => 'Acheter au meilleur prix', 'is_correct' => false],
                            ['text' => 'Garantir un prix juste aux producteurs', 'is_correct' => true],
                            ['text' => 'Acheter uniquement en France', 'is_correct' => false],
                            ['text' => 'Acheter en grande quantité', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 2
                2 => [
                    [
                        'text' => 'Qu\'est-ce que l\'obsolescence programmée ?',
                        'explanation' => 'C\'est quand un produit est volontairement conçu pour avoir une durée de vie limitée, afin qu\'on soit obligé d\'en racheter un nouveau. Exemple : un smartphone qui ralentit après 2 ans.',
                        'options' => [
                            ['text' => 'Un programme de recyclage', 'is_correct' => false],
                            ['text' => 'La conception de produits avec une durée de vie limitée', 'is_correct' => true],
                            ['text' => 'L\'amélioration continue des produits', 'is_correct' => false],
                            ['text' => 'Une garantie prolongée', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel label garantit une production biologique ?',
                        'explanation' => 'Le label AB (Agriculture Biologique) garantit que le produit est cultivé sans pesticides ni engrais chimiques de synthèse, avec respect des cycles naturels et du bien-être animal.',
                        'options' => [
                            ['text' => 'Label Rouge', 'is_correct' => false],
                            ['text' => 'AB (Agriculture Biologique)', 'is_correct' => true],
                            ['text' => 'AOC', 'is_correct' => false],
                            ['text' => 'NF', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Combien de litres d\'eau faut-il pour produire 1 kg de bœuf ?',
                        'explanation' => 'Il faut environ 15 000 litres d\'eau pour produire 1 kg de bœuf ! C\'est énorme comparé aux céréales (1 500 litres) ou aux légumes (300 litres). D\'où l\'intérêt de réduire sa consommation de viande.',
                        'options' => [
                            ['text' => '1 000 litres', 'is_correct' => false],
                            ['text' => '5 000 litres', 'is_correct' => false],
                            ['text' => '15 000 litres', 'is_correct' => true],
                            ['text' => '500 litres', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que l\'empreinte carbone d\'un produit ?',
                        'explanation' => 'L\'empreinte carbone mesure la quantité totale de gaz à effet de serre émis tout au long de la vie d\'un produit : fabrication, transport, utilisation et fin de vie.',
                        'options' => [
                            ['text' => 'Son poids', 'is_correct' => false],
                            ['text' => 'La quantité de CO2 émise lors de sa production et son cycle de vie', 'is_correct' => true],
                            ['text' => 'Son prix', 'is_correct' => false],
                            ['text' => 'Sa durée de vie', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 3
                3 => [
                    [
                        'text' => 'Qu\'est-ce que l\'analyse du cycle de vie (ACV) d\'un produit ?',
                        'explanation' => 'L\'ACV évalue l\'impact environnemental d\'un produit de sa création (extraction des matières premières) à sa fin de vie (recyclage ou élimination), en passant par la fabrication, le transport et l\'utilisation.',
                        'options' => [
                            ['text' => 'Une garantie étendue', 'is_correct' => false],
                            ['text' => 'L\'évaluation de l\'impact environnemental du berceau à la tombe', 'is_correct' => true],
                            ['text' => 'La durée de vie d\'un produit', 'is_correct' => false],
                            ['text' => 'Un certificat de qualité', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que la fast fashion et pourquoi pose-t-elle problème ?',
                        'explanation' => 'La fast fashion, c\'est la mode jetable : des vêtements produits rapidement et à bas coût, souvent dans de mauvaises conditions, qui polluent énormément et finissent vite à la poubelle. L\'industrie textile est l\'une des plus polluantes au monde !',
                        'options' => [
                            ['text' => 'Une mode de qualité', 'is_correct' => false],
                            ['text' => 'Des vêtements jetables produits rapidement et polluants', 'is_correct' => true],
                            ['text' => 'Une marque de luxe', 'is_correct' => false],
                            ['text' => 'Des vêtements de sport', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel est le concept du "zero waste" (zéro déchet) ?',
                        'explanation' => 'Le zero waste vise à réduire au maximum sa production de déchets en suivant la règle des 5R : Refuser (ce dont on n\'a pas besoin), Réduire, Réutiliser, Recycler, Rot (composter). L\'objectif est de tendre vers zéro déchet !',
                        'options' => [
                            ['text' => 'Ne rien acheter', 'is_correct' => false],
                            ['text' => 'Réduire au maximum sa production de déchets', 'is_correct' => true],
                            ['text' => 'Tout recycler', 'is_correct' => false],
                            ['text' => 'Tout brûler', 'is_correct' => false],
                        ]
                    ],
                ],
            ],
            
            // Thème 5: Eau
            'Eau' => [
                // Niveau 1
                1 => [
                    [
                        'text' => 'Quelle est la meilleure façon d\'économiser l\'eau en se lavant ?',
                        'explanation' => 'Prendre une douche rapide (5 minutes) consomme environ 60 à 80 litres d\'eau, contre 150 à 200 litres pour un bain. Le choix est vite fait !',
                        'options' => [
                            ['text' => 'Prendre un bain', 'is_correct' => false],
                            ['text' => 'Prendre une douche rapide', 'is_correct' => true],
                            ['text' => 'Ne pas se laver', 'is_correct' => false],
                            ['text' => 'Laisser couler l\'eau en se savonnant', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Pourquoi ne faut-il pas jeter de produits toxiques dans l\'évier ?',
                        'explanation' => 'Les stations d\'épuration ne peuvent pas tout traiter. Les produits chimiques (peinture, solvants, médicaments) polluent les rivières et les océans s\'ils sont jetés dans les canalisations.',
                        'options' => [
                            ['text' => 'Ça bouche les tuyaux', 'is_correct' => false],
                            ['text' => 'Ça pollue l\'eau et c\'est difficile à traiter', 'is_correct' => true],
                            ['text' => 'Ça sent mauvais', 'is_correct' => false],
                            ['text' => 'C\'est interdit par la loi', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quelle quantité d\'eau douce est disponible sur Terre pour les humains ?',
                        'explanation' => 'L\'eau douce ne représente que 2,5% de l\'eau sur Terre, et la majeure partie est gelée dans les glaciers. Moins de 1% est réellement accessible pour boire et cultiver !',
                        'options' => [
                            ['text' => '50%', 'is_correct' => false],
                            ['text' => '10%', 'is_correct' => false],
                            ['text' => 'Moins de 1%', 'is_correct' => true],
                            ['text' => '100%', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 2
                2 => [
                    [
                        'text' => 'Qu\'est-ce que l\'eau virtuelle ?',
                        'explanation' => 'L\'eau virtuelle est la quantité d\'eau nécessaire pour fabriquer un produit. Par exemple, il faut 15 000 litres d\'eau pour produire 1 kg de bœuf (pour faire pousser l\'herbe et les céréales qu\'il mange).',
                        'options' => [
                            ['text' => 'L\'eau dans les jeux vidéo', 'is_correct' => false],
                            ['text' => 'L\'eau cachée nécessaire à la production d\'un bien', 'is_correct' => true],
                            ['text' => 'L\'eau en bouteille', 'is_correct' => false],
                            ['text' => 'L\'eau de pluie', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Comment récupérer l\'eau de pluie peut-il être utile ?',
                        'explanation' => 'L\'eau de pluie est gratuite et parfaite pour arroser le jardin, laver la voiture ou alimenter les toilettes. Ça permet d\'économiser l\'eau potable traitée.',
                        'options' => [
                            ['text' => 'Pour la boire directement', 'is_correct' => false],
                            ['text' => 'Pour arroser le jardin et économiser l\'eau potable', 'is_correct' => true],
                            ['text' => 'Pour prendre une douche', 'is_correct' => false],
                            ['text' => 'Ce n\'est pas utile', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce qu\'une nappe phréatique ?',
                        'explanation' => 'C\'est une réserve d\'eau souterraine alimentée par l\'infiltration des eaux de pluie. C\'est notre principale source d\'eau potable, il faut donc éviter de la polluer avec des pesticides.',
                        'options' => [
                            ['text' => 'Un lac souterrain', 'is_correct' => false],
                            ['text' => 'Une réserve d\'eau souterraine dans les roches poreuses', 'is_correct' => true],
                            ['text' => 'Une rivière', 'is_correct' => false],
                            ['text' => 'Un océan', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Pourquoi les fuites d\'eau sont-elles un problème majeur ?',
                        'explanation' => 'Un robinet qui goutte peut gaspiller jusqu\'à 120 litres d\'eau par jour ! Réparer les fuites est l\'un des moyens les plus efficaces d\'économiser l\'eau.',
                        'options' => [
                            ['text' => 'Elles font du bruit', 'is_correct' => false],
                            ['text' => 'Elles gaspillent d\'énormes quantités d\'eau potable', 'is_correct' => true],
                            ['text' => 'Elles abîment les meubles', 'is_correct' => false],
                            ['text' => 'Elles ne sont pas graves', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 3
                3 => [
                    [
                        'text' => 'Qu\'est-ce que l\'empreinte hydrique ?',
                        'explanation' => 'L\'empreinte hydrique mesure le volume total d\'eau douce utilisé pour produire les biens et services consommés par un individu ou une communauté. C\'est comme l\'empreinte carbone, mais pour l\'eau !',
                        'options' => [
                            ['text' => 'La taille de ses pieds mouillés', 'is_correct' => false],
                            ['text' => 'Le volume d\'eau total utilisé pour notre consommation', 'is_correct' => true],
                            ['text' => 'La quantité d\'eau qu\'on boit', 'is_correct' => false],
                            ['text' => 'La pluie qui tombe sur une région', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel est le problème du dessalement de l\'eau de mer ?',
                        'explanation' => 'Le dessalement consomme énormément d\'énergie et rejette de la saumure (eau très salée) qui perturbe les écosystèmes marins. C\'est une solution, mais pas sans impact !',
                        'options' => [
                            ['text' => 'Ça donne soif', 'is_correct' => false],
                            ['text' => 'C\'est très énergivore et rejette de la saumure', 'is_correct' => true],
                            ['text' => 'C\'est impossible à faire', 'is_correct' => false],
                            ['text' => 'L\'eau reste salée', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Comment l\'agriculture intensive impacte-t-elle les ressources en eau ?',
                        'explanation' => 'L\'agriculture consomme 70% de l\'eau douce mondiale. L\'irrigation intensive peut assécher les nappes phréatiques et les rivières, et les engrais polluent l\'eau restante.',
                        'options' => [
                            ['text' => 'Elle n\'a aucun impact', 'is_correct' => false],
                            ['text' => 'Elle consomme 70% de l\'eau et peut polluer les nappes', 'is_correct' => true],
                            ['text' => 'Elle crée de l\'eau', 'is_correct' => false],
                            ['text' => 'Elle nettoie l\'eau', 'is_correct' => false],
                        ]
                    ],
                ],
            ],

            // Thème 6: Mobilité durable
            'Mobilité durable' => [
                // Niveau 1
                1 => [
                    [
                        'text' => 'Quel est le mode de transport le plus écologique pour les petits trajets ?',
                        'explanation' => 'La marche ou le vélo ! Zéro émission, bon pour la santé et gratuit. Pour les trajets de moins de 2-3 km, c\'est souvent le plus rapide en ville.',
                        'options' => [
                            ['text' => 'La voiture', 'is_correct' => false],
                            ['text' => 'La marche ou le vélo', 'is_correct' => true],
                            ['text' => 'Le scooter', 'is_correct' => false],
                            ['text' => 'L\'hélicoptère', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Pourquoi le covoiturage est-il bon pour la planète ?',
                        'explanation' => 'Le covoiturage permet de diviser les émissions de CO2 par le nombre de passagers. Moins de voitures sur la route = moins de pollution et moins de bouchons !',
                        'options' => [
                            ['text' => 'On peut discuter', 'is_correct' => false],
                            ['text' => 'Il réduit le nombre de voitures et les émissions par personne', 'is_correct' => true],
                            ['text' => 'C\'est plus rapide', 'is_correct' => false],
                            ['text' => 'C\'est obligatoire', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel transport en commun pollue le moins ?',
                        'explanation' => 'Le train et le tramway sont les champions car ils transportent beaucoup de monde et fonctionnent souvent à l\'électricité (qui peut être décarbonée).',
                        'options' => [
                            ['text' => 'L\'avion', 'is_correct' => false],
                            ['text' => 'Le train', 'is_correct' => true],
                            ['text' => 'Le bus diesel', 'is_correct' => false],
                            ['text' => 'Le bateau de croisière', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 2
                2 => [
                    [
                        'text' => 'La voiture électrique est-elle totalement propre ?',
                        'explanation' => 'Pas totalement. Même si elle n\'émet pas de CO2 en roulant, sa fabrication (surtout la batterie) est polluante. Mais sur sa durée de vie, elle reste bien meilleure qu\'une voiture thermique !',
                        'options' => [
                            ['text' => 'Oui, 100% propre', 'is_correct' => false],
                            ['text' => 'Non, sa fabrication a un impact, mais elle est meilleure à l\'usage', 'is_correct' => true],
                            ['text' => 'Elle est pire que le diesel', 'is_correct' => false],
                            ['text' => 'C\'est pareil', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Qu\'est-ce que l\'intermodalité ?',
                        'explanation' => 'C\'est utiliser plusieurs modes de transport pour un même trajet. Par exemple : vélo jusqu\'à la gare + train + marche jusqu\'au bureau. C\'est la clé pour se passer de la voiture individuelle.',
                        'options' => [
                            ['text' => 'Changer de voiture', 'is_correct' => false],
                            ['text' => 'Combiner plusieurs modes de transport sur un trajet', 'is_correct' => true],
                            ['text' => 'Rouler sur l\'autoroute', 'is_correct' => false],
                            ['text' => 'Utiliser un GPS', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Comment la vitesse influence-t-elle la consommation de carburant ?',
                        'explanation' => 'Plus on roule vite, plus la résistance de l\'air est forte et plus on consomme. Réduire sa vitesse de 10 km/h sur autoroute permet d\'économiser beaucoup de carburant !',
                        'options' => [
                            ['text' => 'Elle n\'a pas d\'influence', 'is_correct' => false],
                            ['text' => 'Plus on va vite, plus on consomme', 'is_correct' => true],
                            ['text' => 'Plus on va vite, moins on consomme', 'is_correct' => false],
                            ['text' => 'Ça dépend de la couleur de la voiture', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel est l\'avantage du télétravail pour la mobilité ?',
                        'explanation' => 'Le meilleur déplacement est celui qu\'on ne fait pas ! Le télétravail évite les trajets domicile-travail quotidiens, réduisant ainsi les émissions de CO2 et les embouteillages.',
                        'options' => [
                            ['text' => 'On peut dormir plus', 'is_correct' => false],
                            ['text' => 'Il supprime les trajets et réduit la pollution', 'is_correct' => true],
                            ['text' => 'On travaille moins', 'is_correct' => false],
                            ['text' => 'On consomme plus d\'électricité', 'is_correct' => false],
                        ]
                    ],
                ],
                // Niveau 3
                3 => [
                    [
                        'text' => 'Qu\'est-ce qu\'une Zone à Faibles Émissions (ZFE) ?',
                        'explanation' => 'Une ZFE est une zone urbaine où l\'accès est restreint pour les véhicules les plus polluants (Crit\'Air 4, 5...). L\'objectif est d\'améliorer la qualité de l\'air en ville.',
                        'options' => [
                            ['text' => 'Une zone sans voitures', 'is_correct' => false],
                            ['text' => 'Une zone interdisant les véhicules les plus polluants', 'is_correct' => true],
                            ['text' => 'Une zone de limitation de vitesse', 'is_correct' => false],
                            ['text' => 'Une zone de stationnement gratuit', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'L\'hydrogène est-il l\'avenir de la mobilité ?',
                        'explanation' => 'L\'hydrogène est prometteur pour les transports lourds (camions, trains, bus) car il offre une grande autonomie. Mais pour être écologique, il doit être produit avec de l\'électricité renouvelable (hydrogène vert).',
                        'options' => [
                            ['text' => 'Non, c\'est dangereux', 'is_correct' => false],
                            ['text' => 'Oui, surtout pour les transports lourds, s\'il est produit proprement', 'is_correct' => true],
                            ['text' => 'C\'est déjà la norme partout', 'is_correct' => false],
                            ['text' => 'C\'est une énergie fossile', 'is_correct' => false],
                        ]
                    ],
                    [
                        'text' => 'Quel est l\'impact du transport de marchandises (fret) ?',
                        'explanation' => 'Le transport de marchandises représente une part importante des émissions mondiales. Privilégier le fret ferroviaire ou fluvial plutôt que routier permet de réduire considérablement cet impact.',
                        'options' => [
                            ['text' => 'Il est négligeable', 'is_correct' => false],
                            ['text' => 'Il est majeur, d\'où l\'intérêt du train et du bateau', 'is_correct' => true],
                            ['text' => 'Il ne concerne que les bateaux', 'is_correct' => false],
                            ['text' => 'Il est moins polluant que la voiture', 'is_correct' => false],
                        ]
                    ],
                ],
            ],
        ];

        // Create quizzes and questions for each theme
        foreach ($themes as $theme) {
            $themeTitle = $theme->title;

            if (!isset($questionsData[$themeTitle])) {
                continue;
            }

            foreach ($levels as $level) {
                $levelNumber = $level->order;

                if (!isset($questionsData[$themeTitle][$levelNumber])) {
                    continue;
                }

                // Create quiz for this theme and level
                $quiz = Quiz::create([
                    'id' => Str::uuid(),
                    'title' => $theme->title . ' - ' . $level->name,
                    'theme_id' => $theme->id,
                    'level_id' => $level->id,
                    'max_score' => 100,
                ]);

                // Create questions for this quiz
                foreach ($questionsData[$themeTitle][$levelNumber] as $questionData) {
                    $question = Question::create([
                        'id' => Str::uuid(),
                        'quiz_id' => $quiz->id,
                        'text' => $questionData['text'],
                        'type' => 'multiple_choice',
                        'explanation' => $questionData['explanation'],
                    ]);

                    // Create answer options (keep stable order - no shuffle!)
                    foreach ($questionData['options'] as $optionData) {
                        AnswerOption::create([
                            'id' => Str::uuid(),
                            'question_id' => $question->id,
                            'text' => $optionData['text'],
                            'is_correct' => $optionData['is_correct'],
                        ]);
                    }
                }
            }
        }

        $this->command->info('Quiz and questions seeded successfully!');
    }
}
