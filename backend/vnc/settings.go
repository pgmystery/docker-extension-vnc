package vnc

type SettingsData struct {
	ViewOnly                   bool    `json:"viewOnly"`
	QualityLevel               int     `json:"qualityLevel"`
	CompressionLevel           int     `json:"compressionLevel"`
	ShowDotCursor              bool    `json:"showDotCursor"`
	PlayBell                   bool    `json:"playBell"`
	Scaling                    Scaling `json:"scaling"`
	ShowHiddenContainerWarning bool    `json:"showHiddenContainerWarning"`
	Audio                      Audio   `json:"audio"`
}

type Scaling struct {
	ClipToWindow bool   `json:"clipToWindow"`
	Resize       string `json:"resize"`
}

type Audio struct {
	Output AudioOutput `json:"output"`
	Input  AudioInput  `json:"input"`
}

type AudioOutput struct {
	Enabled bool `json:"enabled"`
	Volume  int  `json:"volume"`
	Muted   bool `json:"muted"`
}

type AudioInput struct {
	Enabled bool   `json:"enabled"`
	Muted   bool   `json:"muted"`
	Device  string `json:"device,omitempty"`
}

func getDefaultSettings() SettingsData {
	return SettingsData{
		QualityLevel:     6,
		CompressionLevel: 2,
		ShowDotCursor:    false,
		ViewOnly:         false,
		PlayBell:         true,
		Scaling: Scaling{
			ClipToWindow: false,
			Resize:       "scale",
		},
		ShowHiddenContainerWarning: true,
		Audio: Audio{
			Output: AudioOutput{
				Enabled: true,
				Volume:  50,
				Muted:   false,
			},
			Input: AudioInput{
				Enabled: true,
				Muted:   false,
			},
		},
	}
}
