import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

import fetch_cards as fetcher


def page(stats=None, rows=None):
    ssr = None if stats is None else {
        "limitedCardStatsResp": {"data": {"data": stats}},
        "minifiedMtgaJsonData": {"localeData": [[1, "Test card"]], "cardData": rows or []},
    }
    return '<script id="__NEXT_DATA__">' + json.dumps({
        "props": {"pageProps": {"ssrProps": ssr}}
    }) + '</script>'


class FetchTests(unittest.TestCase):
    def test_unreleased_set_is_waiting(self):
        with patch.object(fetcher, "fetch", return_value=page()):
            cards, _ = fetcher.try_untapped(fetcher.SETS["fra"], strict=True)
        self.assertIsNone(cards)

    def test_network_failure_is_not_treated_as_unreleased(self):
        with patch.object(fetcher, "fetch", side_effect=urllib.error.URLError("offline")):
            with self.assertRaises(urllib.error.URLError):
                fetcher.try_untapped(fetcher.SETS["fra"], strict=True)

    def test_changed_page_layout_is_an_error(self):
        with patch.object(fetcher, "fetch", return_value="<html>challenge</html>"):
            with self.assertRaisesRegex(ValueError, "layout"):
                fetcher.try_untapped(fetcher.SETS["fra"], strict=True)

    def test_wrong_set_is_rejected(self):
        row = [0, 1, 0, 0, 0, 0, "HOB", "oW", 1, 2]
        html = page({"1": {"ALL": {"bronze": [[600], [500, 250]]}}}, [row])
        with patch.object(fetcher, "fetch", return_value=html):
            with self.assertRaisesRegex(ValueError, "no FRA"):
                fetcher.try_untapped(fetcher.SETS["fra"], strict=True)

    def test_cards_without_games_are_still_waiting(self):
        row = [0, 1, 0, 0, 0, 0, "FRA", "oW", 1, 2]
        html = page({"1": {"ALL": {"bronze": [[0], [0, 0]]}}}, [row])
        with patch.object(fetcher, "fetch", return_value=html):
            cards, _ = fetcher.try_untapped(fetcher.SETS["fra"], strict=True)
        self.assertIsNone(cards)

    def test_same_batch_preserves_timestamp_and_sample_threshold(self):
        row = [0, 1, 0, 0, 0, 0, "FRA", "oW", 1, 2]
        html = page({"1": {"ALL": {"bronze": [[393], [300, 150]]}}}, [row])
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "cards_fra.json"
            with patch.object(fetcher, "fetch", return_value=html), patch(
                "sys.argv", ["fetch_cards.py", "--set", "fra", "--source", "untapped",
                             "--wait-for-data", "--no-images", "--out", str(output)]
            ):
                self.assertEqual(fetcher.main(), 0)
                payload = json.loads(output.read_text())
                self.assertEqual(payload["rated_count"], 0)
                self.assertIsNone(payload["cards"][0]["score"])
                payload["generated_at"] = "2026-09-29 00:00"
                output.write_text(json.dumps(payload))
                self.assertEqual(fetcher.main(), 0)
                self.assertEqual(json.loads(output.read_text()), payload)

    def test_waiting_does_not_overwrite_existing_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "cards_fra.json"
            output.write_text("previous database")
            with patch.object(fetcher, "fetch", return_value=page()), patch(
                "sys.argv", ["fetch_cards.py", "--set", "fra", "--source", "untapped",
                             "--wait-for-data", "--out", str(output)]
            ):
                self.assertEqual(fetcher.main(), 2)
            self.assertEqual(output.read_text(), "previous database")
            self.assertFalse(output.with_suffix(".js").exists())

    def test_first_import_registers_script_once(self):
        with tempfile.TemporaryDirectory() as tmp:
            html = Path(tmp) / "index.html"
            html.write_text('<script>\n"use strict";\n</script>')
            fetcher.bump_cache_version("cards_fra.js", "first", html)
            fetcher.bump_cache_version("cards_fra.js", "second", html)
            content = html.read_text()
            self.assertEqual(content.count('src="cards_fra.js'), 1)
            self.assertIn(fetcher.hashlib.md5(b"second").hexdigest()[:8], content)


if __name__ == "__main__":
    unittest.main()
