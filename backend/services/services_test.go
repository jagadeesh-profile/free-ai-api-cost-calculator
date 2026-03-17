package main

import (
	"os"
	"testing"
)

// Test Encryption Service initialization
func TestNewEncryptionService(t *testing.T) {
	// Set environment variable
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	
	service := NewEncryptionService()
	
	if service == nil {
		t.Fatal("EncryptionService should not be nil")
	}
	
	if service.key == nil {
		t.Fatal("Encryption key should not be nil")
	}
	
	if len(service.key) != 32 {
		t.Errorf("Expected 32-byte key, got %d bytes", len(service.key))
	}
}

// Test EncryptAPIKey
func TestEncryptAPIKey(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	
	tests := []struct {
		name    string
		apiKey  string
		wantErr bool
	}{
		{
			name:    "Valid API key",
			apiKey:  "sk-test-123456789",
			wantErr: false,
		},
		{
			name:    "Empty key",
			apiKey:  "",
			wantErr: false, // Should still encrypt empty string
		},
		{
			name:    "Long API key",
			apiKey:  "sk-" + string(make([]byte, 500)),
			wantErr: false,
		},
		{
			name:    "Special characters",
			apiKey:  "!@#$%^&*()_+-=[]{}|;':,.<>?/",
			wantErr: false,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			encrypted := service.EncryptAPIKey(tt.apiKey)
			
			if tt.wantErr && encrypted == "" {
				return
			}
			
			if !tt.wantErr && encrypted == "" {
				t.Error("Expected encrypted result, got empty string")
			}
			
			// Encrypted should be different from plaintext
			if encrypted == tt.apiKey {
				t.Error("Encrypted key should differ from plaintext")
			}
		})
	}
}

// Test DecryptAPIKey
func TestDecryptAPIKey(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	
	testKeys := []string{
		"sk-test-123456789",
		"openai-key-abc123",
		"anthropic-secret",
		"google-cloud-key",
	}
	
	for _, originalKey := range testKeys {
		t.Run(originalKey, func(t *testing.T) {
			// Encrypt
			encrypted := service.EncryptAPIKey(originalKey)
			
			// Decrypt
			decrypted := service.DecryptAPIKey(encrypted)
			
			// Should match original
			if decrypted != originalKey {
				t.Errorf("Expected %q, got %q", originalKey, decrypted)
			}
		})
	}
}

// Test Encryption/Decryption Round Trip
func TestEncryptDecryptRoundTrip(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	
	original := "test-api-key-12345"
	
	encrypted := service.EncryptAPIKey(original)
	decrypted := service.DecryptAPIKey(encrypted)
	
	if decrypted != original {
		t.Errorf("Round trip failed: %q -> %q -> %q", original, encrypted, decrypted)
	}
}

// Test Different Encryption Keys Produce Different Results
func TestDifferentKeysProduceDifferentEncryption(t *testing.T) {
	key1 := "test-key-number-one-for-encryption"
	key2 := "test-key-number-two-for-encryption"
	
	os.Setenv("ENCRYPTION_KEY", key1)
	service1 := NewEncryptionService()
	encrypted1 := service1.EncryptAPIKey("api-key-123")
	
	os.Setenv("ENCRYPTION_KEY", key2)
	service2 := NewEncryptionService()
	encrypted2 := service2.EncryptAPIKey("api-key-123")
	
	if encrypted1 == encrypted2 {
		t.Error("Different keys should produce different ciphertexts")
	}
}

// Test Invalid Encrypted Data
func TestDecryptInvalidData(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	
	invalidInputs := []string{
		"not-base64!",
		"aW52YWxpZA==", // Valid base64 but not valid ciphertext
		"",
		"x",
	}
	
	for _, input := range invalidInputs {
		t.Run(input, func(t *testing.T) {
			// Should not panic
			result := service.DecryptAPIKey(input)
			
			// Result should be empty or error handled gracefully
			t.Logf("Decryption result: %q", result)
		})
	}
}

// Test Encryption Key Padding
func TestEncryptionKeyPadding(t *testing.T) {
	tests := []struct {
		name        string
		envKey      string
		expectedLen int
	}{
		{
			name:        "Short key gets padded",
			envKey:      "short",
			expectedLen: 32,
		},
		{
			name:        "Exact 32 bytes",
			envKey:      "01234567890123456789012345678901",
			expectedLen: 32,
		},
		{
			name:        "Long key gets truncated",
			envKey:      "this-is-a-very-long-key-that-exceeds-32-bytes-and-should-be-truncated",
			expectedLen: 32,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			os.Setenv("ENCRYPTION_KEY", tt.envKey)
			service := NewEncryptionService()
			
			if len(service.key) != tt.expectedLen {
				t.Errorf("Expected key length %d, got %d", tt.expectedLen, len(service.key))
			}
		})
	}
}

// Test Concurrent Encryption/Decryption
func TestConcurrentEncryption(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	
	done := make(chan bool, 10)
	
	for i := 0; i < 10; i++ {
		go func(index int) {
			apiKey := "api-key-" + string(rune(index))
			encrypted := service.EncryptAPIKey(apiKey)
			decrypted := service.DecryptAPIKey(encrypted)
			
			if decrypted != apiKey {
				t.Errorf("Concurrent operation %d failed", index)
			}
			
			done <- true
		}(i)
	}
	
	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}
}

// Benchmark encryption
func BenchmarkEncryptAPIKey(b *testing.B) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	apiKey := "sk-test-123456789"
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = service.EncryptAPIKey(apiKey)
	}
}

// Benchmark decryption
func BenchmarkDecryptAPIKey(b *testing.B) {
	os.Setenv("ENCRYPTION_KEY", "test-key-for-encryption-service")
	service := NewEncryptionService()
	
	encrypted := service.EncryptAPIKey("sk-test-123456789")
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = service.DecryptAPIKey(encrypted)
	}
}

