
import React, { useState, useMemo } from 'react';
import { User, Seller, Persona } from '../../types';
import { stringToColor } from '../common/ColorUtils';

// Props
interface NetworkVisualizationProps {
    currentUser: User;
    allUsers: User[];
    allSellers: Seller[];
    onSelectSeller: (seller: Seller) => void;
}

// Data structures
type Connection = (User | Seller) & { entityType: 'User' | 'Seller' };

interface HierarchyNode {
    name: string;
    value: number;
    children: HierarchyNode[];
    entity?: Connection;
    depth: number;
}

interface TooltipData {
    x: number;
    y: number;
    title: string;
    subtitle: string;
    color: string;
}

// Helper to convert polar coordinates to cartesian
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInRadians: number) => {
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

// Helper to create SVG arc path
const describeArc = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    const start2 = polarToCartesian(x, y, innerRadius, endAngle);
    const end2 = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", end2.x, end2.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, start2.x, start2.y,
        "Z"
    ].join(" ");

    return d;
};

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ currentUser, allUsers, allSellers, onSelectSeller }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [hoveredPath, setHoveredPath] = useState<string[]>([]);

    // 1. Build Flat List of Connections
    const connections: Connection[] = useMemo(() => {
        const connectionIds = new Set(currentUser.connections || []);
        const sellerConnections: Connection[] = allSellers
            .filter(s => connectionIds.has(s.id))
            .map(s => ({ ...s, entityType: 'Seller' }));
        const userConnections: Connection[] = allUsers
            .filter(u => connectionIds.has(u.id))
            .map(u => ({ ...u, entityType: 'User' }));
        return [...sellerConnections, ...userConnections];
    }, [currentUser, allUsers, allSellers]);

    // 2. Build Hierarchy: Root -> Geo -> Industry -> Value Chain -> Entity
    const hierarchy = useMemo(() => {
        const root: HierarchyNode = { name: 'Root', value: 0, children: [], depth: 0 };

        connections.forEach(conn => {
            // Extract attributes (defaulting to "Unspecified" if missing)
            let geo = 'Unspecified';
            let industry = 'Unspecified';
            let vc = 'Unspecified';

            if (conn.entityType === 'Seller') {
                const s = conn as Seller;
                geo = s.solutions[0]?.geography[0] || 'Unspecified';
                industry = s.solutions[0]?.industry[0] || 'Unspecified';
                vc = s.solutions[0]?.valueChain[0] || 'Unspecified';
            } else {
                const u = conn as User;
                geo = u.interests?.geography?.[0] || 'Unspecified';
                industry = u.interests?.industry?.[0] || 'Unspecified';
                vc = u.interests?.valueChain?.[0] || 'Unspecified';
            }

            // Find or create Geo Node
            let geoNode = root.children.find(c => c.name === geo);
            if (!geoNode) {
                geoNode = { name: geo, value: 0, children: [], depth: 1 };
                root.children.push(geoNode);
            }

            // Find or create Industry Node
            let indNode = geoNode.children.find(c => c.name === industry);
            if (!indNode) {
                indNode = { name: industry, value: 0, children: [], depth: 2 };
                geoNode.children.push(indNode);
            }

            // Find or create Value Chain Node
            let vcNode = indNode.children.find(c => c.name === vc);
            if (!vcNode) {
                vcNode = { name: vc, value: 0, children: [], depth: 3 };
                indNode.children.push(vcNode);
            }

            // Add Entity Node
            const name = conn.entityType === 'Seller' ? (conn as Seller).companyName : (conn as User).name;
            vcNode.children.push({
                name: name,
                value: 1,
                children: [],
                entity: conn,
                depth: 4
            });
        });

        // Recursively calculate values (count of leaves)
        const calcValue = (node: HierarchyNode): number => {
            if (node.children.length === 0) return 1; // Leaf
            node.value = node.children.reduce((sum, child) => sum + calcValue(child), 0);
            return node.value;
        };
        calcValue(root);

        // Sort children by value for better visual layout
        const sortChildren = (node: HierarchyNode) => {
            if(node.children.length > 0) {
                node.children.sort((a, b) => b.value - a.value);
                node.children.forEach(sortChildren);
            }
        }
        sortChildren(root);

        return root;
    }, [connections]);

    // Layout Constants
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const totalValue = hierarchy.value || 1; // Avoid divide by zero
    
    // Radius configuration
    const centerRadius = 50;
    const ringWidth = 60;
    const gap = 2; // px

    // Render Function
    const renderArcs = (node: HierarchyNode, startAngle: number, endAngle: number, currentPath: string[] = []) => {
        const elements: React.ReactElement[] = [];
        const totalAngle = endAngle - startAngle;
        let currentAngle = startAngle;

        // Don't render root ring, start from children
        if (node.depth > 0) {
            const innerR = centerRadius + (node.depth - 1) * ringWidth;
            const outerR = innerR + ringWidth - gap;
            
            // Determine color
            let color = '#ccc';
            if (node.depth === 1) color = stringToColor(node.name); // Geo base color
            else if (node.depth === 2) color = stringToColor(currentPath[0]); // Industry inherits Geo tint (simplified for now to just base)
            else if (node.depth === 3) color = stringToColor(currentPath[0]); // VC inherits
            else if (node.depth === 4) {
                // Entity Node
                const persona = node.entity?.entityType === 'Seller' ? 'Seller' : (node.entity as User).persona;
                const personaColors: Record<string, string> = {
                    Buyer: '#4D96FF', Seller: '#6BCB77', Investor: '#FFD93D', Collaborator: '#A78BFA', Admin: '#F87171', Browser: '#9CA3AF'
                };
                color = personaColors[persona] || '#999';
            }

            // Adjust opacity based on depth or path
            const opacity = node.depth === 4 ? 1 : 0.6 + (node.depth * 0.1);
            const isHovered = hoveredPath.includes(node.name);
            const isPathDimmed = hoveredPath.length > 0 && !isHovered && !hoveredPath.includes(node.name);

            elements.push(
                <path
                    key={`${node.depth}-${node.name}-${startAngle}`}
                    d={describeArc(centerX, centerY, innerR, outerR, currentAngle, currentAngle + totalAngle - 0.02)} // 0.02 gap in radians
                    fill={color}
                    opacity={isPathDimmed ? 0.3 : opacity}
                    stroke={isHovered ? "white" : "none"}
                    strokeWidth={2}
                    className="transition-all duration-300 cursor-pointer hover:opacity-100"
                    onMouseEnter={(e) => {
                        const newPath = [...currentPath, node.name];
                        setHoveredPath(newPath);
                        setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            title: node.name,
                            subtitle: node.depth === 4 
                                ? (node.entity?.entityType === 'Seller' ? 'Seller' : (node.entity as User).designation) 
                                : `${node.value} Connection${node.value > 1 ? 's' : ''}`,
                            color: color
                        });
                    }}
                    onMouseLeave={() => {
                        setHoveredPath([]);
                        setTooltip(null);
                    }}
                    onClick={() => {
                        if (node.depth === 4 && node.entity?.entityType === 'Seller') {
                            onSelectSeller(node.entity as Seller);
                        }
                    }}
                />
            );
        }

        // Render Children
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                const childAngle = (child.value / node.value) * totalAngle;
                elements.push(...renderArcs(child, currentAngle, currentAngle + childAngle, [...currentPath, node.name]));
                currentAngle += childAngle;
            });
        }

        return elements;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
                <h2 className="text-2xl font-bold">My Connections Burst</h2>
                <div className="flex gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 opacity-60"></span>Geo</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 opacity-80"></span>Industry</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400"></span>Val. Chain</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-gray-400"></span>Entity</div>
                </div>
            </div>
            
            <div className="relative bg-brand-card-light dark:bg-gray-800 rounded-2xl p-4 border border-brand-border shadow-inner overflow-hidden flex justify-center">
                {connections.length === 0 ? (
                    <div className="h-[500px] w-full flex items-center justify-center text-gray-500">
                        No connections yet. Connect with users to see your network burst.
                    </div>
                ) : (
                    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                        {/* Recursive Arcs */}
                        <g transform={`rotate(-90 ${centerX} ${centerY})`}>
                            {renderArcs(hierarchy, 0, 2 * Math.PI)}
                        </g>

                        {/* Center User Avatar */}
                        <defs>
                            <clipPath id="centerAvatarClip">
                                <circle cx={centerX} cy={centerY} r={centerRadius - 5} />
                            </clipPath>
                            <filter id="shadow">
                                <feDropShadow dx="0" dy="0" stdDeviation="5" floodOpacity="0.3"/>
                            </filter>
                        </defs>
                        <circle cx={centerX} cy={centerY} r={centerRadius} fill="white" filter="url(#shadow)" />
                        <image 
                            href={currentUser.avatarUrl} 
                            x={centerX - (centerRadius - 5)} 
                            y={centerY - (centerRadius - 5)} 
                            width={(centerRadius - 5) * 2} 
                            height={(centerRadius - 5) * 2} 
                            clipPath="url(#centerAvatarClip)"
                        />
                        <circle cx={centerX} cy={centerY} r={centerRadius - 5} fill="none" stroke="var(--color-primary-accent)" strokeWidth="3" />
                    </svg>
                )}

                {tooltip && (
                    <div 
                        className="fixed bg-brand-card/95 backdrop-blur-sm border border-brand-border text-brand-text-light dark:text-white text-sm rounded-lg p-3 shadow-xl pointer-events-none z-50 animate-fadeIn"
                        style={{ top: tooltip.y + 20, left: tooltip.x + 20, minWidth: '150px' }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tooltip.color }}></span>
                            <span className="font-bold">{tooltip.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">{tooltip.subtitle}</p>
                    </div>
                )}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 max-w-2xl">
                Start from the center and move outward: 
                <span className="font-semibold text-brand-primary"> Geography</span> &rarr; 
                <span className="font-semibold text-brand-primary"> Industry</span> &rarr; 
                <span className="font-semibold text-brand-primary"> Value Chain</span> &rarr; 
                <span className="font-semibold text-brand-primary"> Connection</span>
            </div>
        </div>
    );
};

export default NetworkVisualization;
