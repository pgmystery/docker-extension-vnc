package vnc

type SettingsData struct {
	ViewOnly         bool `json:"viewOnly"`
	QualityLevel     int  `json:"qualityLevel"`
	CompressionLevel int  `json:"compressionLevel"`
	ShowDotCursor    bool `json:"showDotCursor"`
}

func getDefaultSettings() SettingsData {
	return SettingsData{
		QualityLevel:     6,
		CompressionLevel: 2,
		ShowDotCursor:    false,
		ViewOnly:         false,
	}
}
