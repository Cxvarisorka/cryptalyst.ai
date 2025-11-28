import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import portfolioCollectionService from '@/services/portfolioCollection.service';
import { useToast } from '@/components/ui/use-toast';

export default function PortfolioManager({ onCollectionChange }) {
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    color: '#10b981',
    icon: 'briefcase'
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await portfolioCollectionService.getCollections();
      setCollections(response.data || []);

      // Set default collection as selected
      const defaultCol = response.data?.find(col => col.isDefault);
      if (defaultCol) {
        setSelectedCollection(defaultCol);
        onCollectionChange?.(defaultCol);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio collections',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCollection = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a portfolio name',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await portfolioCollectionService.createCollection(formData);
      toast({
        title: 'Success',
        description: 'Portfolio created successfully'
      });
      setShowCreateDialog(false);
      setFormData({ name: '', description: '', visibility: 'private', color: '#10b981', icon: 'briefcase' });
      loadCollections();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create portfolio',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollection = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a portfolio name',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await portfolioCollectionService.updateCollection(selectedCollection._id, formData);
      toast({
        title: 'Success',
        description: 'Portfolio updated successfully'
      });
      setShowEditDialog(false);
      loadCollections();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update portfolio',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    setLoading(true);
    try {
      await portfolioCollectionService.deleteCollection(selectedCollection._id);
      toast({
        title: 'Success',
        description: 'Portfolio deleted successfully'
      });
      setShowDeleteDialog(false);
      loadCollections();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete portfolio',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    setFormData({
      name: selectedCollection.name,
      description: selectedCollection.description || '',
      visibility: selectedCollection.visibility,
      color: selectedCollection.color,
      icon: selectedCollection.icon
    });
    setShowEditDialog(true);
  };

  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
    onCollectionChange?.(collection);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Collection Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: selectedCollection?.color }} />
            <span className="max-w-[150px] truncate">{selectedCollection?.name || 'Select Portfolio'}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {collections.map((collection) => (
            <DropdownMenuItem
              key={collection._id}
              onClick={() => handleSelectCollection(collection)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <Briefcase className="w-4 h-4" style={{ color: collection.color }} />
                <span className="flex-1 truncate">{collection.name}</span>
                {collection.isDefault && (
                  <span className="text-xs text-muted-foreground">(Default)</span>
                )}
                {collection.visibility === 'public' ? (
                  <Eye className="w-3 h-3 text-green-500" />
                ) : (
                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {collection.assetCount || 0}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Button */}
      <Button
        size="sm"
        onClick={() => setShowCreateDialog(true)}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4 mr-1" />
        Create
      </Button>

      {/* Edit Button */}
      {selectedCollection && (
        <Button
          size="sm"
          variant="outline"
          onClick={openEditDialog}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}

      {/* Delete Button */}
      {selectedCollection && !selectedCollection.isDefault && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Portfolio Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Long-term Investments"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Portfolio Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCollection} disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Portfolio?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedCollection?.name}"? All assets in this
            portfolio will be moved to your default portfolio.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCollection}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
