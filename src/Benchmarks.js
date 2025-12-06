function benchmarkModuleData_(views, token) {
  var results = [];
  for (var i = 0; i < views.length; i++) {
    var viewId = views[i];
    var start = Date.now();
    var res = getModuleData(viewId, token, { page: 1, pageSize: 25 });
    var end = Date.now();
    results.push({ viewId: viewId, ok: !!(res && res.success), ms: end - start, count: (res && res.pagination) ? res.pagination.totalRecords : 0 });
  }
  return results;
}

function runPerformanceBenchmarks(token) {
  var views = [
    "VIEW_HRM_Employees",
    "VIEW_PRJ_Main",
    "VIEW_FIN_DirectExpenses",
    "VIEW_SYS_Users",
  ];
  var out = benchmarkModuleData_(views, token);
  Logger.log("Benchmarks: " + JSON.stringify(out));
  return { success: true, results: out };
}
