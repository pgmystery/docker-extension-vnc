package vnc

type SettingsData struct {
	ViewOnly         bool    `json:"viewOnly"`
	QualityLevel     int     `json:"qualityLevel"`
	CompressionLevel int     `json:"compressionLevel"`
	ShowDotCursor    bool    `json:"showDotCursor"`
	Scaling          Scaling `json:"scaling"`
}

type Scaling struct {
	ClipToWindow bool   `json:"clipToWindow"`
	Resize       string `json:"resize"`
}

func getDefaultSettings() SettingsData {
	return SettingsData{
		QualityLevel:     6,
		CompressionLevel: 2,
		ShowDotCursor:    false,
		ViewOnly:         false,
		Scaling: Scaling{
			ClipToWindow: false,
			Resize:       "scale",
		},
	}
}
