import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Check, Upload, X } from 'lucide-react';
import { Product, StoreAvailability, Category } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/lib/imageCompressor';

interface ProductFormWizardProps {
  product?: Product | null;
  categories: Category[];
  onSave: (formData: any, imageFile: File | null, currentImageUrl?: string) => Promise<void>;
  onClose: () => void;
}

const tagOptions = [
  { value: 'best-seller', label: 'Best Seller', color: 'bg-green-100 text-green-800' },
  { value: 'new-arrival', label: 'New Arrival', color: 'bg-blue-100 text-blue-800' },
  { value: 'trending', label: 'Trending', color: 'bg-purple-100 text-purple-800' },
  { value: 'limited-edition', label: 'Limited Edition', color: 'bg-orange-100 text-orange-800' },
];

const ProductFormWizard = ({ product, categories, onSave, onClose }: ProductFormWizardProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // All form state - initialized once, never reset
  const [productName, setProductName] = useState(product?.name || '');
  const [productPrice, setProductPrice] = useState(product?.price?.toString() || '0');
  const [productDiscountPrice, setProductDiscountPrice] = useState(product?.discountPrice?.toString() || '');
  const [productStock, setProductStock] = useState(product?.stock?.toString() || '0');
  const [productDescription, setProductDescription] = useState(product?.description || '');
  const [productFeatures, setProductFeatures] = useState(product?.features?.join('\n') || '');
  const [formCategory, setFormCategory] = useState(product?.categoryId?.toString() || '');
  const [formSubcategory, setFormSubcategory] = useState(product?.subcategoryId?.toString() || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(product?.tags || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [imageUrl, setImageUrl] = useState<string>(product?.image || '');
  const [compressing, setCompressing] = useState(false);
  const [storeAvailability, setStoreAvailability] = useState<StoreAvailability>(
    product?.availableAt || {
      hyderabad: true,
      vizag: false,
      warangal: false
    }
  );

  const selectedCategoryData = categories.find(c => c.id.toString() === formCategory);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid Image",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    setCompressing(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      toast({
        title: "Image Selected",
        description: "Image will be uploaded to Firebase Storage when you save the product.",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    const formData = {
      name: productName,
      price: productPrice,
      discountPrice: productDiscountPrice,
      stock: productStock,
      image: imagePreview || imageUrl,
      description: productDescription,
      features: productFeatures,
      tags: selectedTags,
      categoryId: formCategory,
      subcategoryId: formSubcategory,
      availableAt: storeAvailability,
    };
    await onSave(formData, imageFile, product?.image);
    onClose();
  };

  const canProceedFromStep = () => {
    switch (currentStep) {
      case 1:
        return productName.trim() !== '' && formCategory !== '' && formSubcategory !== '';
      case 2:
        return imagePreview !== '' || imageUrl !== '';
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input 
            id="name" 
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name" 
            required 
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formCategory} onValueChange={setFormCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.iconName ? (
                    <img src={cat.iconName} alt={cat.name} className="w-4 h-4 inline mr-2" />
                  ) : (
                    <span className="mr-2">📦</span>
                  )}
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subcategory">Subcategory *</Label>
          <Select value={formSubcategory} onValueChange={setFormSubcategory} disabled={!formCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategoryData?.subcategories.map(sub => (
                <SelectItem key={sub.id} value={sub.id.toString()}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input 
            id="price" 
            type="number" 
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            placeholder="0" 
            required
          />
        </div>

        <div>
          <Label htmlFor="discountPrice">Discount Price (₹)</Label>
          <Input 
            id="discountPrice" 
            type="number" 
            value={productDiscountPrice}
            onChange={(e) => setProductDiscountPrice(e.target.value)}
            placeholder="Optional" 
          />
        </div>

        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input 
            id="stock" 
            type="number" 
            value={productStock}
            onChange={(e) => setProductStock(e.target.value)}
            placeholder="0" 
            required
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Image Upload
  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Product Image</h3>
      <div className="space-y-4">
        {imagePreview && (
          <div className="relative w-64 h-64 border rounded-lg overflow-hidden mx-auto">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => {
                setImagePreview('');
                setImageFile(null);
                setImageUrl('');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Label
            htmlFor="image-upload"
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>{compressing ? 'Processing...' : imageFile ? 'Change Image' : 'Upload Image'}</span>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={compressing}
            className="hidden"
          />
          {!imagePreview && (
            <div className="space-y-2">
              <Label htmlFor="image-url">Or enter image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                  }
                }}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Upload an image (max 1MB) or enter an image URL
          </p>
        </div>
      </div>
    </div>
  );

  // Step 3: Product Details
  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Product Details</h3>
      <div className="space-y-4">
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tagOptions.map(tag => (
              <label
                key={tag.value}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer border transition-all
                  ${selectedTags.includes(tag.value) 
                    ? `${tag.color} border-transparent` 
                    : 'bg-muted border-border hover:bg-muted/80'
                  }
                `}
              >
                <Checkbox
                  checked={selectedTags.includes(tag.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTags([...selectedTags, tag.value]);
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tag.value));
                    }
                  }}
                />
                <span className="text-sm">{tag.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Product description..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="features">Features</Label>
          <Textarea 
            id="features" 
            value={productFeatures}
            onChange={(e) => setProductFeatures(e.target.value)}
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter each feature on a new line
          </p>
        </div>
      </div>
    </div>
  );

  // Step 4: Store Availability & Review
  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Store Availability</h3>
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Hyderabad</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${storeAvailability.hyderabad ? 'text-green-600' : 'text-muted-foreground'}`}>
              {storeAvailability.hyderabad ? 'ON' : 'OFF'}
            </span>
            <button
              type="button"
              onClick={() => setStoreAvailability({ ...storeAvailability, hyderabad: !storeAvailability.hyderabad })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                storeAvailability.hyderabad ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  storeAvailability.hyderabad ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Visakhapatnam</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${storeAvailability.vizag ? 'text-green-600' : 'text-muted-foreground'}`}>
              {storeAvailability.vizag ? 'ON' : 'OFF'}
            </span>
            <button
              type="button"
              onClick={() => setStoreAvailability({ ...storeAvailability, vizag: !storeAvailability.vizag })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                storeAvailability.vizag ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  storeAvailability.vizag ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Warangal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${storeAvailability.warangal ? 'text-green-600' : 'text-muted-foreground'}`}>
              {storeAvailability.warangal ? 'ON' : 'OFF'}
            </span>
            <button
              type="button"
              onClick={() => setStoreAvailability({ ...storeAvailability, warangal: !storeAvailability.warangal })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                storeAvailability.warangal ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  storeAvailability.warangal ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold mb-3">Review Summary</h4>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Name:</span> {productName || 'Not set'}</div>
          <div><span className="font-medium">Category:</span> {selectedCategoryData?.name || 'Not selected'}</div>
          <div><span className="font-medium">Price:</span> ₹{productPrice}</div>
          <div><span className="font-medium">Stock:</span> {productStock}</div>
          <div><span className="font-medium">Image:</span> {imagePreview ? '✓ Selected' : 'Not selected'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep === step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : currentStep > step
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-muted text-muted-foreground border-muted'
                }`}
              >
                {currentStep > step ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span className="text-xs mt-1 text-center">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Image'}
                {step === 3 && 'Details'}
                {step === 4 && 'Availability'}
              </span>
            </div>
            {step < 4 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  currentStep > step ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-2 pt-4 border-t">
        <div>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceedFromStep()}
              className="bg-accent hover:bg-accent/90"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              className="bg-accent hover:bg-accent/90"
            >
              <Check className="h-4 w-4 mr-2" />
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFormWizard;

