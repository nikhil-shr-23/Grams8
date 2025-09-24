import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DbRelationship, relationshipTypes } from "@/lib/constants";
import { type AppEdge, type AppNode } from "@/lib/types";
import { useStore, type StoreState } from "@/store/store";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";

interface EdgeInspectorPanelProps {
    edge: AppEdge;
    nodes: AppNode[];
}

export default function EdgeInspectorPanel({ edge, nodes }: EdgeInspectorPanelProps) {
    const { updateEdge, deleteEdge } = useStore(
        useShallow((state: StoreState) => ({
            updateEdge: state.updateEdge,
            deleteEdge: state.deleteEdge,
        }))
    );

    const diagram = useStore(useShallow((state: StoreState) =>
        state.diagrams.find(d => d.id === state.selectedDiagramId)
    ));

    const isLocked = diagram?.data.isLocked ?? false;

    const [relationshipType, setRelationshipType] = useState(edge.data?.relationship || DbRelationship.ONE_TO_MANY);

    useEffect(() => {
        if (edge) {
            setRelationshipType(edge.data?.relationship || DbRelationship.ONE_TO_MANY);
        }
    }, [edge]);

    if (!edge) return null;

    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    const getColumnIdFromHandle = (handleId: string | null | undefined): string | null => {
        if (!handleId) return null;
        const parts = handleId.split('-');
        return parts.length >= 3 ? parts.slice(0, -2).join('-') : handleId;
    };

    const sourceColumnId = getColumnIdFromHandle(edge.sourceHandle);
    const targetColumnId = getColumnIdFromHandle(edge.targetHandle);

    const sourceColumn = sourceNode?.data.columns.find((c) => c.id === sourceColumnId);
    const targetColumn = targetNode?.data.columns.find((c) => c.id === targetColumnId);

    const handleTypeChange = (value: string) => {
        setRelationshipType(value);
        const newEdge: AppEdge = {
            ...edge,
            data: { ...edge.data, relationship: value },
        };
        updateEdge(newEdge);
    };

    return (
        <div className="h-full w-full">
            <h3 className="text-lg font-semibold mb-4">Relationship Details</h3>
            <Separator />
            <div className="my-4 space-y-2 text-sm">
                <p><strong>From:</strong> {sourceNode?.data.label}.{sourceColumn?.name}</p>
                <p><strong>To:</strong> {targetNode?.data.label}.{targetColumn?.name}</p>
            </div>
            <Separator />
            <div className="my-4">
                <Label>Relationship Type</Label>
                <Select value={relationshipType} onValueChange={handleTypeChange} disabled={isLocked}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {relationshipTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Separator />
            <div className="mt-6">
                <AlertDialog>
                    <AlertDialogTrigger asChild disabled={isLocked}>
                        <Button variant="destructive" className="w-full" disabled={isLocked}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Relationship
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the relationship between "{sourceNode?.data.label}.{sourceColumn?.name}" and "{targetNode?.data.label}.{targetColumn?.name}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEdge(edge.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}