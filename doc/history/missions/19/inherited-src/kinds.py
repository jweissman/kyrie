# What each inherited row is (the process audit, 4 November): a defect (something wrong now or when reported), an
# obligation (a commissioned or owner-asked requirement), a recommendation (a reviewer's proposed remedy), or an
# ambition (optional future scope). An unresolved defect or obligation is Open risk; only an ambition or a superseded
# recommendation may be Deferred. Clusters are the audit's root causes (§4): A legal state as decision, B identity
# inferred from text, C pipelines that do not compose, D tests prove components, E reference-journey overfit,
# F workarounds counted as authorability, G scope/status compression.
KIND = {
    # architecture defects and inherited architecture obligations
    'ARV-H5': ('defect', 'B'), 'COR-12': ('defect', 'B'), 'ARV-A24': ('defect', ''), 'ARV-H7': ('defect', ''),
    'ARV-M6': ('defect', 'F'), 'ARV-M7': ('defect', 'F'), 'AUT-25': ('obligation', 'F'), 'COR-04': ('defect', ''),
    'ARV-A19': ('defect', 'B'), 'ARV-A9': ('defect', ''), 'ARV-H6': ('defect', 'D'), 'ARV-M8': ('defect', ''),
    'AUT-07': ('defect', 'F'), 'COR-18': ('defect', 'D'), 'WPC-14': ('defect', 'F'),
    # player-facing defects and obligations
    'NAR-12': ('defect', 'B'), 'NAR-14': ('defect', 'A'), 'NAV-10': ('obligation', 'C'), 'PT-01': ('defect', 'C'),
    'PT-15': ('defect', 'E'), 'NAR-17': ('obligation', 'C'), 'OWN-80': ('obligation', 'A'), 'REV-13': ('defect', 'C'),
    'REV-23': ('defect', 'C'), 'IND-01': ('defect', 'C'), 'IND-06': ('defect', 'A'), 'SYS-04': ('recommendation', 'C'),
    'SYS-06': ('recommendation', 'C'), 'SYS-08': ('recommendation', 'E'), 'SYS-01': ('recommendation', 'A'),
    # content and authoring
    'PRE-05': ('defect', ''), 'NAR-01': ('defect', 'C'), 'CTH-09': ('defect', 'F'), 'OWN-41': ('obligation', ''),
    'OWN-42': ('obligation', ''), 'OWN-44': ('obligation', ''), 'WPC-X04': ('defect', 'F'), 'WPC-06': ('defect', 'F'),
    'QTC-21': ('defect', 'F'),
    # action integrity: the five the audit names
    'ARV-A5': ('defect', 'D'), 'GTR-X03': ('defect', 'F'), 'LWR-02': ('defect', 'A'), 'QTC-10': ('defect', 'B'),
    'BOF-15': ('defect', 'A'),
    # author friction that is a defect, not a language wish
    'BOF-08': ('defect', 'F'), 'BOF-16': ('defect', 'F'), 'BOF-20': ('defect', 'F'), 'BOF-22': ('defect', 'F'),
    'BOF-30': ('defect', 'D'), 'QTC-A24': ('defect', 'F'), 'QTC-A10': ('defect', 'F'), 'QTC-A04': ('defect', 'F'),
    'QTC-19': ('defect', 'F'), 'WPC-X05': ('defect', 'F'), 'WPC-X06': ('defect', 'C'), 'WPC-18': ('defect', 'C'),
    'GTR-21': ('defect', 'F'), 'LOR-16': ('defect', 'F'), 'TTN-02': ('defect', 'F'), 'BOF-09': ('defect', 'F'),
    'WPC-X08': ('obligation', 'E'), 'CTH-05': ('defect', 'F'),
    # recommendations (language proposals) and ambitions
    **{k: ('recommendation', 'F') for k in ['IFR-01', 'IFR-02', 'IFR-03', 'IFR-04', 'IFR-05', 'IFR-06', 'IFR-07', 'IFR-08',
                                           'IFR-09', 'IFR-10']},
    **{k: ('ambition', '') for k in ['ARV-M5', 'ARV-M2', 'AUT-09', 'NAR-18', 'OWN-34', 'OWN-36', 'OWN-37', 'OWN-38',
                                    'NVR-20', 'NVR-21', 'GTR-26', 'WPC-01', 'GTR-27', 'GTR-X20', 'GTR-X21', 'WPC-X02',
                                    'WPC-X09', 'FWR-05', 'QIS-01', 'BTW-11', 'LOR-09', 'LOR-13', 'QTC-14', 'QTC-A02',
                                    'QTC-A20', 'BOF-10', 'BOF-11', 'BOF-24', 'BOF-33', 'BOF-34']},
}
# Re-entry: when an Open risk row is taken up again, or by when.
TRIGGER = {
    'defect': 'Re-entry: reproduce on the current build before Mission 20 is commissioned; fix or narrow with a spec.',
    'obligation': 'Re-entry: Mission 20 commission names it, or the owner drops it.',
    'recommendation': 'Re-entry: when its cluster is next commissioned; children keep their own acceptance.',
    'ambition': '',
}
