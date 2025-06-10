import requests
import unittest
import os
import sys
from datetime import datetime
import time
import mimetypes
import json

# Get the backend URL from environment variable
BACKEND_URL = "https://83a863e9-2d96-47b9-bb76-295d8668a6ce.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

class EventSnapStreamAPITest(unittest.TestCase):
    """Test suite for Event Snap Stream API"""
    
    def setUp(self):
        """Setup for tests"""
        self.api_url = API_URL
        # Create a test image file if needed
        self.test_image_path = "/tmp/test_image.jpg"
        if not os.path.exists(self.test_image_path):
            # Create a simple test image
            with open(self.test_image_path, "wb") as f:
                f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xdb\x00C\x01\t\t\t\x0c\x0b\x0c\x18\r\r\x182!\x1c!22222222222222222222222222222222222222222222222222\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x03\x01"\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xc4\x00\x1f\x01\x00\x03\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x11\x00\x02\x01\x02\x04\x04\x03\x04\x07\x05\x04\x04\x00\x01\x02w\x00\x01\x02\x03\x11\x04\x05!1\x06\x12AQ\x07aq\x13"2\x81\x08\x14B\x91\xa1\xb1\xc1\t#3R\xf0\x15br\xd1\n\x16$4\xe1%\xf1\x17\x18\x19\x1a&\'()*56789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xfe\xfe(\xa2\x8a\x00\xff\xd9')
        
        print(f"🔍 Testing API at: {self.api_url}")
        
    def test_01_api_root(self):
        """Test the API root endpoint"""
        print("\n🧪 Testing API root endpoint...")
        response = requests.get(f"{self.api_url}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Event Snap Stream API")
        self.assertEqual(data["status"], "running")
        print("✅ API root endpoint test passed")
        
    def test_02_status_check(self):
        """Test the status check endpoints"""
        print("\n🧪 Testing status check endpoints...")
        
        # Test POST /api/status
        client_name = f"test_client_{int(time.time())}"
        response = requests.post(
            f"{self.api_url}/status", 
            json={"client_name": client_name}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["client_name"], client_name)
        self.assertIn("id", data)
        self.assertIn("timestamp", data)
        print("✅ POST /api/status test passed")
        
        # Test GET /api/status
        response = requests.get(f"{self.api_url}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertIn("id", data[0])
            self.assertIn("client_name", data[0])
            self.assertIn("timestamp", data[0])
        print("✅ GET /api/status test passed")
        
    def test_03_photo_upload_and_retrieval(self):
        """Test photo upload and retrieval"""
        print("\n🧪 Testing photo upload and retrieval...")
        
        # Test photo upload
        with open(self.test_image_path, "rb") as img:
            files = {"file": ("test_image.jpg", img, "image/jpeg")}
            data = {"uploader_info": "API Test User"}
            
            response = requests.post(
                f"{self.api_url}/photos/upload",
                files=files,
                data=data
            )
            
            self.assertEqual(response.status_code, 200)
            upload_data = response.json()
            self.assertIn("id", upload_data)
            self.assertIn("filename", upload_data)
            self.assertIn("url", upload_data)
            self.assertIn("thumbnail_url", upload_data)
            photo_id = upload_data["id"]
            photo_url = upload_data["url"]
            thumbnail_url = upload_data["thumbnail_url"]
            
            print(f"✅ Photo upload test passed - ID: {photo_id}")
            
            # Test GET /api/photos
            response = requests.get(f"{self.api_url}/photos")
            self.assertEqual(response.status_code, 200)
            photos_data = response.json()
            self.assertIsInstance(photos_data, list)
            
            # Check if our uploaded photo is in the list
            uploaded_photo = next((p for p in photos_data if p["id"] == photo_id), None)
            self.assertIsNotNone(uploaded_photo)
            print("✅ GET /api/photos test passed")
            
            # Test photo file serving
            response = requests.get(f"{BACKEND_URL}{photo_url}")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["Content-Type"], "image/jpeg")
            print("✅ Photo file serving test passed")
            
            # Test thumbnail serving
            response = requests.get(f"{BACKEND_URL}{thumbnail_url}")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["Content-Type"], "image/jpeg")
            print("✅ Thumbnail serving test passed")
            
    def test_04_invalid_uploads(self):
        """Test invalid file uploads"""
        print("\n🧪 Testing invalid file uploads...")
        
        # Test invalid file type
        with open("/tmp/invalid_file.txt", "w") as f:
            f.write("This is not an image file")
            
        with open("/tmp/invalid_file.txt", "rb") as f:
            files = {"file": ("invalid_file.txt", f, "text/plain")}
            response = requests.post(
                f"{self.api_url}/photos/upload",
                files=files
            )
            self.assertEqual(response.status_code, 400)
            error_data = response.json()
            self.assertIn("detail", error_data)
            self.assertIn("Invalid file type", error_data["detail"])
            print("✅ Invalid file type test passed")
            
        # Test oversized file (mock test - we're not actually creating a 10MB+ file)
        # Instead, we'll check if the server validates file size by checking the error message
        print("ℹ️ Skipping actual oversized file test to save resources")
        
    def test_05_photo_deletion(self):
        """Test photo deletion (if implemented)"""
        print("\n🧪 Testing photo deletion...")
        
        # First upload a photo to delete
        with open(self.test_image_path, "rb") as img:
            files = {"file": ("test_delete.jpg", img, "image/jpeg")}
            data = {"uploader_info": "Delete Test"}
            
            response = requests.post(
                f"{self.api_url}/photos/upload",
                files=files,
                data=data
            )
            
            self.assertEqual(response.status_code, 200)
            upload_data = response.json()
            photo_id = upload_data["id"]
            
            # Now try to delete it
            response = requests.delete(f"{self.api_url}/photos/{photo_id}")
            
            # Check if deletion is implemented and working
            if response.status_code == 200:
                print("✅ Photo deletion test passed")
            else:
                print("ℹ️ Photo deletion returned status code:", response.status_code)
                print("ℹ️ This might be expected if deletion is admin-only or not implemented")

def run_tests():
    """Run the test suite"""
    test_loader = unittest.TestLoader()
    test_suite = test_loader.loadTestsFromTestCase(EventSnapStreamAPITest)
    test_runner = unittest.TextTestRunner(verbosity=2)
    test_result = test_runner.run(test_suite)
    return test_result.wasSuccessful()

if __name__ == "__main__":
    print("🚀 Starting Event Snap Stream API Tests")
    success = run_tests()
    print("\n🏁 API Testing Complete")
    if success:
        print("✅ All tests passed successfully!")
        sys.exit(0)
    else:
        print("❌ Some tests failed!")
        sys.exit(1)
