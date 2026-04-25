'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Upload, Camera, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';

interface BodyCompFormProps {
  onSave: (bodyComp: any) => void;
  onCancel: () => void;
  initial?: any;
}

export function BodyCompForm({ onSave, onCancel, initial }: BodyCompFormProps) {
  // Input method
  const [inputMethod, setInputMethod] = useState<'manual' | 'scan'>('manual');
  
  // Required fields
  const [weight, setWeight] = useState(initial?.weight?.toString() || '');
  const [bodyFat, setBodyFat] = useState(initial?.bodyFat?.toString() || '');
  const [muscleMass, setMuscleMass] = useState(initial?.muscleMass?.toString() || '');
  const [bmi, setBmi] = useState(initial?.bmi?.toString() || '');
  
  // User profile fields (captured in body comp)
  const [height, setHeight] = useState(initial?.height?.toString() || '');
  const [age, setAge] = useState(initial?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(initial?.gender || 'male');
  
  // Optional advanced metrics
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skeletalMuscleMass, setSkeletalMuscleMass] = useState(initial?.skeletalMuscleMass?.toString() || '');
  const [bodyFatMass, setBodyFatMass] = useState(initial?.bodyFatMass?.toString() || '');
  const [totalBodyWater, setTotalBodyWater] = useState(initial?.totalBodyWater?.toString() || '');
  const [protein, setProtein] = useState(initial?.protein?.toString() || '');
  const [minerals, setMinerals] = useState(initial?.minerals?.toString() || '');
  const [visceralFatLevel, setVisceralFatLevel] = useState(initial?.visceralFatLevel?.toString() || '');
  const [basalMetabolicRate, setBasalMetabolicRate] = useState(initial?.basalMetabolicRate?.toString() || '');
  
  // Measurements
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [waist, setWaist] = useState(initial?.waist?.toString() || '');
  const [chest, setChest] = useState(initial?.chest?.toString() || '');
  const [arms, setArms] = useState(initial?.arms?.toString() || '');
  const [thighs, setThighs] = useState(initial?.thighs?.toString() || '');
  const [hips, setHips] = useState(initial?.hips?.toString() || '');
  const [neck, setNeck] = useState(initial?.neck?.toString() || '');
  
  // Metadata
  const [testProvider, setTestProvider] = useState(initial?.testProvider || '');
  const [testLocation, setTestLocation] = useState(initial?.testLocation || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  
  // Image upload state - support multiple images (for reference only)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages: string[] = [];

      // Just store images for reference (no OCR processing)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert to base64 for storage
        const reader = new FileReader();
        const imagePromise = new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const imageData = await imagePromise;
        newImages.push(imageData);
      }

      // Add new images to the list
      setUploadedImages([...uploadedImages, ...newImages]);
      
    } catch (error) {
      console.error('Image upload error:', error);
      setExtractionError('Failed to upload image. Please try again.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!weight || !bodyFat || !muscleMass || !bmi) {
      setValidationErrors(['Please fill in all required fields: Weight, Body Fat %, Muscle Mass, and BMI']);
      return;
    }

    const bodyComp: any = {
      id: initial?.id || crypto.randomUUID(),
      date: initial?.date || new Date().toISOString().split('T')[0],
      createdAt: initial?.createdAt || new Date().toISOString(),
      
      // Required fields
      weight: parseFloat(weight),
      bodyFat: parseFloat(bodyFat),
      muscleMass: parseFloat(muscleMass),
      bmi: parseFloat(bmi),
      
      // User profile fields
      height: height ? parseFloat(height) : undefined,
      age: age ? parseFloat(age) : undefined,
      gender,
      
      // Measurements (always include, default to 0)
      waist: parseFloat(waist) || 0,
      chest: parseFloat(chest) || 0,
      arms: parseFloat(arms) || 0,
      thighs: parseFloat(thighs) || 0,
      
      // Notes
      notes,
    };

    // Add optional fields if provided
    if (skeletalMuscleMass) bodyComp.skeletalMuscleMass = parseFloat(skeletalMuscleMass);
    if (bodyFatMass) bodyComp.bodyFatMass = parseFloat(bodyFatMass);
    if (totalBodyWater) bodyComp.totalBodyWater = parseFloat(totalBodyWater);
    if (protein) bodyComp.protein = parseFloat(protein);
    if (minerals) bodyComp.minerals = parseFloat(minerals);
    if (visceralFatLevel) bodyComp.visceralFatLevel = parseFloat(visceralFatLevel);
    if (basalMetabolicRate) bodyComp.basalMetabolicRate = parseFloat(basalMetabolicRate);
    if (hips) bodyComp.hips = parseFloat(hips);
    if (neck) bodyComp.neck = parseFloat(neck);
    if (testProvider) bodyComp.testProvider = testProvider;
    if (testLocation) bodyComp.testLocation = testLocation;
    if (uploadedImages.length > 0) bodyComp.scanImages = uploadedImages;

    onSave(bodyComp);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'manual' | 'scan')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">
            <Camera className="h-4 w-4 mr-2" />
            Upload Scan
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Upload className="h-4 w-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {uploadedImages.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Scan ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add More Images
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Upload Scan for Reference
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload your body composition scan images (InBody, HDFC, etc.)
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>OCR Feature Coming Soon</strong><br/>
                    Auto-extraction is under development. Please enter data manually for now.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images (Optional)
                </Button>
              </div>
            )}

            {extractionError && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">{extractionError}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <p className="text-sm text-muted-foreground mb-4">
            Enter your body composition data manually
          </p>
        </TabsContent>
      </Tabs>

      {validationErrors.length > 0 && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg space-y-1">
          {validationErrors.map((error, i) => (
            <p key={i} className="text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* User Profile Fields */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Profile Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Height (cm)</label>
            <Input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Age</label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Gender</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={gender === 'male' ? 'default' : 'outline'}
                onClick={() => setGender('male')}
                className="flex-1"
              >
                Male
              </Button>
              <Button
                type="button"
                variant={gender === 'female' ? 'default' : 'outline'}
                onClick={() => setGender('female')}
                className="flex-1"
              >
                Female
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Body Composition *</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg) *</label>
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="79"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Body Fat % *</label>
            <Input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="14"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Muscle Mass (kg) *</label>
            <Input
              type="number"
              step="0.1"
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value)}
              placeholder="60"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">BMI *</label>
            <Input
              type="number"
              step="0.1"
              value={bmi}
              onChange={(e) => setBmi(e.target.value)}
              placeholder="23.8"
              required
            />
          </div>
        </div>
      </div>

      {/* Advanced Metrics (Expandable) */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between"
        >
          <span className="text-sm font-medium">Advanced Metrics</span>
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 pl-4">
            <div className="space-y-2">
              <label className="text-sm">Skeletal Muscle Mass (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={skeletalMuscleMass}
                onChange={(e) => setSkeletalMuscleMass(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Body Fat Mass (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={bodyFatMass}
                onChange={(e) => setBodyFatMass(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Total Body Water (L)</label>
              <Input
                type="number"
                step="0.1"
                value={totalBodyWater}
                onChange={(e) => setTotalBodyWater(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Protein (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Minerals (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={minerals}
                onChange={(e) => setMinerals(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Visceral Fat Level</label>
              <Input
                type="number"
                step="1"
                value={visceralFatLevel}
                onChange={(e) => setVisceralFatLevel(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm">Basal Metabolic Rate (kcal)</label>
              <Input
                type="number"
                step="1"
                value={basalMetabolicRate}
                onChange={(e) => setBasalMetabolicRate(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </div>

      {/* Measurements (Expandable) */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowMeasurements(!showMeasurements)}
          className="w-full justify-between"
        >
          <span className="text-sm font-medium">Body Measurements</span>
          {showMeasurements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showMeasurements && (
          <div className="grid grid-cols-2 gap-3 pl-4">
            <div className="space-y-2">
              <label className="text-sm">Waist (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Chest (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Arms (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
                placeholder="35"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Thighs (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={thighs}
                onChange={(e) => setThighs(e.target.value)}
                placeholder="55"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Hips (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Neck (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm">Test Provider</label>
          <Input
            value={testProvider}
            onChange={(e) => setTestProvider(e.target.value)}
            placeholder="InBody, HDFC, etc."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Test Location</label>
          <Input
            value={testLocation}
            onChange={(e) => setTestLocation(e.target.value)}
            placeholder="Gym, Clinic, etc."
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How do you look/feel?"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </form>
  );
}

// Made with Bob
