package com.movementrecoverycompanion

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

/**
 * Activity to display the Health Connect privacy policy.
 * This is required by Health Connect to show users how their health data is used.
 */
class HealthConnectPrivacyPolicyActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val webView = WebView(this)
        webView.webViewClient = WebViewClient()
        webView.settings.javaScriptEnabled = true

        // Load the privacy policy
        // In production, replace this with your actual privacy policy URL
        val privacyPolicyHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                        background-color: #fff;
                    }
                    h1 { color: #1a1a1a; font-size: 24px; }
                    h2 { color: #333; font-size: 18px; margin-top: 24px; }
                    p { margin: 12px 0; }
                    ul { padding-left: 20px; }
                    li { margin: 8px 0; }
                </style>
            </head>
            <body>
                <h1>Movement & Recovery Health Data Privacy Policy</h1>

                <h2>What Health Data We Collect</h2>
                <p>Movement & Recovery Companion collects the following health data from Health Connect:</p>
                <ul>
                    <li><strong>Heart Rate & HRV:</strong> Used to calculate your daily readiness score</li>
                    <li><strong>Sleep Data:</strong> Helps us understand your recovery status</li>
                    <li><strong>Steps & Activity:</strong> Tracks your daily movement</li>
                    <li><strong>Exercise Sessions:</strong> Records your workout history</li>
                    <li><strong>Body Measurements:</strong> Weight and height for personalization</li>
                </ul>

                <h2>How We Use Your Data</h2>
                <p>Your health data is used exclusively to:</p>
                <ul>
                    <li>Calculate your daily readiness score</li>
                    <li>Personalize workout recommendations</li>
                    <li>Track your recovery progress</li>
                    <li>Adapt workouts based on your physical state</li>
                </ul>

                <h2>Data Storage & Security</h2>
                <p>Your health data is:</p>
                <ul>
                    <li>Stored securely on your device</li>
                    <li>Encrypted during transmission</li>
                    <li>Never sold to third parties</li>
                    <li>Only synced to our servers with your explicit consent</li>
                </ul>

                <h2>Your Rights</h2>
                <p>You can:</p>
                <ul>
                    <li>Revoke Health Connect permissions at any time</li>
                    <li>Request deletion of your health data</li>
                    <li>Export your health data</li>
                </ul>

                <h2>Contact</h2>
                <p>For questions about your health data, contact us at privacy@movementrecovery.app</p>
            </body>
            </html>
        """.trimIndent()

        webView.loadDataWithBaseURL(null, privacyPolicyHtml, "text/html", "UTF-8", null)
        setContentView(webView)
    }
}
